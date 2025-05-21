from flask import Flask, Response, request, render_template_string
import cv2
import numpy as np
import time
from werkzeug.serving import WSGIRequestHandler

app = Flask(__name__)


class UnlimitedRequestHandler(WSGIRequestHandler):
    def handle(self):
        try:
            self.connection.setsockopt(6, 7, 1)
            super().handle()
        except ConnectionResetError:
            pass

latest_frame = None

# Testing purposes, frontend should use <img src="127.0.0.1:5000/stream" />
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
    global latest_frame
    try:
        content_len = request.content_length or 0
        # print(f"\nIncoming request size: {content_len} bytes")
        if content_len > (100 * 1024 * 1024):
            return "File exceeds 100 MB limit", 413

        frame_data = request.get_data()
        if not frame_data:
            return "No data received", 400

        # print(f"Received {len(frame_data)} bytes of image data")
        nparr = np.frombuffer(frame_data, np.uint8)
        latest_frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if latest_frame is None:
            return "Failed to decode image", 400

        # print(f"Frame decoded: {latest_frame.shape[1]}×{latest_frame.shape[0]}")
        return "OK", 200

    except Exception as e:
        print(f"Error processing frame: {e}")
        return f"Server error: {e}", 500

def generate_frames():
    """
    Yield one JPEG frame at a time in multipart/x-mixed-replace format.
    Throttle with a small sleep so Python doesn’t spin at 100% CPU and 
    let RAM usage stay stable.
    """
    while True:
        if latest_frame is None:
            # no frame yet: sleep briefly to avoid busy‐loop
            time.sleep(0.05)
            continue

        # Encode the latest frame as JPEG
        ret, buffer = cv2.imencode('.jpg', latest_frame, [
            int(cv2.IMWRITE_JPEG_QUALITY),
            80
        ])
        if not ret:
            # encoding failed for whatever reason; skip this iteration
            time.sleep(0.05)
            continue

        frame_bytes = buffer.tobytes()
        yield (
            b'--frame\r\n'
            b'Content-Type: image/jpeg\r\n\r\n' +
            frame_bytes +
            b'\r\n'
        )

        # Limit live feed to 20 FPS
        time.sleep(0.05)

@app.route('/stream')
def stream():
    return Response(
        generate_frames(),
        mimetype='multipart/x-mixed-replace; boundary=frame'
    )

if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=5000,
        threaded=True,
        debug=True,
        request_handler=UnlimitedRequestHandler
    )
