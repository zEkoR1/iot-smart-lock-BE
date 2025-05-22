from flask import Flask, Response, request, render_template_string, jsonify
import cv2
import numpy as np
import time
import face_recognition
import base64
from werkzeug.serving import WSGIRequestHandler

app = Flask(__name__)

# Allowing large image files to prevent errors
class UnlimitedRequestHandler(WSGIRequestHandler):
    def handle(self):
        try:
            self.connection.setsockopt(6, 7, 1)
            super().handle()
        except ConnectionResetError:
            pass


# Haar cascade for drawing boxes on the streamed frames
face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
)

# Holds the 128-d face encoding from /register_face
saved_face_encoding = None

# Holds the latest raw BGR frame to be streamed
latest_frame = None


@app.route('/')
def index():
    return render_template_string("""
        <!doctype html>
        <html>
        <head>
            <title>ESP32 Live Feed</title>
        </head>
        <body style="margin:0; background:#000;">
            <h2 style="color:#fff; text-align:center; margin:10px 0;">
                Simulated ESP32 Camera Live Feed
            </h2>
            <div style="display:flex; justify-content:center;">
                <img src="{{ url_for('stream') }}"
                     style="max-width:100%; height:auto; border:2px solid #444;" />
            </div>
        </body>
        </html>
    """)


@app.route('/video_feed', methods=['POST'])
def receive_frame():
    """
    Receive a raw JPEG frame via POST and update latest_frame so /stream can show it.
    We do NOT perform any face-ID here. Streaming is entirely separate.
    """
    global latest_frame

    try:
        content_len = request.content_length or 0
        if content_len > (100 * 1024 * 1024):
            return "File exceeds 100 MB limit", 413

        frame_data = request.get_data()
        if not frame_data:
            return "No data received", 400

        nparr = np.frombuffer(frame_data, np.uint8)
        bgr_frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if bgr_frame is None:
            return "Failed to decode image", 400

        # Always save the raw frame for streaming
        latest_frame = bgr_frame.copy()
        return "OK", 200

    except Exception as e:
        print(f"Error processing frame: {e}")
        return f"Server error: {e}", 500


def generate_frames():
    """
    Continuously yield the most recent frame (annotated with Haar-cascade boxes).
    """
    while True:
        if latest_frame is None:
            time.sleep(0.05)
            continue

        frame = latest_frame.copy()
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(30, 30),
            flags=cv2.CASCADE_SCALE_IMAGE
        )
        for (x, y, w, h) in faces:
            cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)

        ret, buffer = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), 80])
        if not ret:
            time.sleep(0.05)
            continue

        frame_bytes = buffer.tobytes()
        yield (
            b'--frame\r\n'
            b'Content-Type: image/jpeg\r\n\r\n' +
            frame_bytes +
            b'\r\n'
        )
        time.sleep(0.05)


@app.route('/stream')
def stream():
    return Response(
        generate_frames(),
        mimetype='multipart/x-mixed-replace; boundary=frame'
    )


@app.route('/register_face', methods=['POST'])
def register_face():
    """
    Expects a JSON body: { "image": "<base64-encoded JPEG>" }
    - Decode Base64 → BGR → RGB.
    - Detect exactly one face. If 0 or >1 faces, return HTTP 400 with an error.
    - Compute the 128-d encoding and store in saved_face_encoding.
    - Return { "valid": "yes" } if exactly one face was found and stored.
    """
    global saved_face_encoding

    try:
        data = request.get_json()
        if not data or "image" not in data:
            return jsonify({"error": "Missing 'image' field"}), 400

        b64str = data["image"]
        try:
            img_bytes = base64.b64decode(b64str)
        except Exception:
            return jsonify({"error": "Invalid base64 in 'image' field"}), 400

        nparr = np.frombuffer(img_bytes, np.uint8)
        bgr_img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if bgr_img is None:
            return jsonify({"error": "Failed to decode image"}), 400

        rgb_img = cv2.cvtColor(bgr_img, cv2.COLOR_BGR2RGB)
        face_locs = face_recognition.face_locations(rgb_img)

        if len(face_locs) == 0:
            return jsonify({"error": "No face detected"}), 400
        if len(face_locs) > 1:
            return jsonify({"error": "Multiple faces detected"}), 400

        encs = face_recognition.face_encodings(rgb_img, face_locs)
        if not encs:
            return jsonify({"error": "Failed to compute face encoding"}), 500

        saved_face_encoding = encs[0]
        return jsonify({"valid": "yes"}), 200

    except Exception as e:
        print(f"Error in /register_face: {e}")
        return jsonify({"error": f"Server error: {e}"}), 500


@app.route('/faceid', methods=['POST'])
def faceid():
    """
    Expects a JSON body:
      {
        "gallery": ["<base64_img1>", "<base64_img2>", ...],
        "probe": "<base64_probe_img>"
      }

    For each gallery entry:
      - Decode Base64 → BGR → RGB.
      - Detect exactly one face; else return HTTP 400 with an error.
      - Compute its face encoding.

    For the probe image:
      - Decode Base64 → BGR → RGB.
      - Detect exactly one face; else return HTTP 400 with an error.
      - Compute its face encoding, then compare to every gallery encoding.
      - If any match (tolerance=0.6), return { "valid": "yes" }, else { "valid": "no" }.
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON body provided"}), 400

        gallery_b64 = data.get("gallery")
        probe_b64 = data.get("probe")

        if not isinstance(gallery_b64, list) or len(gallery_b64) == 0:
            return jsonify({"error": "Missing or empty 'gallery' array"}), 400
        if not isinstance(probe_b64, str) or not probe_b64:
            return jsonify({"error": "Missing 'probe' image"}), 400

        gallery_encodings = []
        # Process each gallery image
        for idx, b64str in enumerate(gallery_b64):
            try:
                img_data = base64.b64decode(b64str)
            except Exception:
                return jsonify({"error": f"Gallery[{idx}] is not valid base64"}), 400

            nparr = np.frombuffer(img_data, np.uint8)
            bgr_img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if bgr_img is None:
                return jsonify({"error": f"Failed to decode gallery[{idx}]"}), 400

            rgb_img = cv2.cvtColor(bgr_img, cv2.COLOR_BGR2RGB)
            face_locs = face_recognition.face_locations(rgb_img)

            if len(face_locs) == 0:
                return jsonify({"error": f"No face detected in gallery[{idx}]"}), 400
            if len(face_locs) > 1:
                return jsonify({"error": f"Multiple faces detected in gallery[{idx}]"}), 400

            encs = face_recognition.face_encodings(rgb_img, face_locs)
            if not encs:
                return jsonify({"error": f"Failed to encode face in gallery[{idx}]"}), 500

            gallery_encodings.append(encs[0])

        # Process the image taken from the live cam
        try:
            probe_data = base64.b64decode(probe_b64)
        except Exception:
            return jsonify({"error": "Probe image is not valid base64"}), 400

        probe_nparr = np.frombuffer(probe_data, np.uint8)
        bgr_probe = cv2.imdecode(probe_nparr, cv2.IMREAD_COLOR)
        if bgr_probe is None:
            return jsonify({"error": "Failed to decode probe image"}), 400

        rgb_probe = cv2.cvtColor(bgr_probe, cv2.COLOR_BGR2RGB)
        probe_locs = face_recognition.face_locations(rgb_probe)

        if len(probe_locs) == 0:
            return jsonify({"error": "No face detected in probe image"}), 400
        if len(probe_locs) > 1:
            return jsonify({"error": "Multiple faces detected in probe image"}), 400

        probe_encs = face_recognition.face_encodings(rgb_probe, probe_locs)
        if not probe_encs:
            return jsonify({"error": "Failed to encode face in probe image"}), 500

        probe_encoding = probe_encs[0]

        # Compare probe_encoding against each gallery_encoding
        for idx, gal_enc in enumerate(gallery_encodings):
            match = face_recognition.compare_faces([gal_enc], probe_encoding, tolerance=0.6)[0]
            if match:
                return jsonify({"valid": "yes"}), 200

        # No matches found
        return jsonify({"valid": "no"}), 200

    except Exception as e:
        print(f"Error in /faceid: {e}")
        return jsonify({"error": f"Server error: {e}"}), 500


if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=5000,
        threaded=True,
        debug=True,
        request_handler=UnlimitedRequestHandler
    )
