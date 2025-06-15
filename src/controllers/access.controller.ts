import { Request, Response } from 'express';
import {verifyUserDevice} from "../middlewares/device-auth.middleware";
const biometricService = require('../services/biometric.service');
const accessTokenService = require('../services/access-token.service');
const authService = require('../services/auth.service')
// Handle biometric authentication
export async function authenticateBiometrics(req: Request, res: Response) {
  try {
    const { fingerprint, face, deviceId } = req.body;
    // const deviceId = req.body.deviceId;


    if (!fingerprint || !face) {
      return res.status(400).json({ message: 'Both fingerprint and face data are required' });
    }

    // Get hashes from external service
    // const fingerprintHash = await biometricService.getHashFromExternalService(
    //   fingerprintData,
    //   'fingerprint'
    // );

    // const faceHash = await biometricService.getHashFromExternalService(
    //   faceData,
    //   'face'
    // );

    // Verify biometrics against database
    const verificationResult = await biometricService.verifyBiometrics(
        fingerprint,
        face
    );


    if (!verificationResult.success) {
      await accessTokenService.logAccess({
        deviceId,
        status: false,
        message: 'Biometric authentication failed',
        ipAddress: req.ip
      });

      return res.status(401).json({ message: 'Not authorized' });
    }



    // Generate access token for the verified user
    const accessToken = await accessTokenService.generateAccessToken(
      verificationResult.userId,
      deviceId
    );

    return res.json({
      message: 'Authentication successful',
      ...accessToken
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Authentication error:', err);
    return res.status(500).json({ message: `Authentication error: ${err.message}` });
  }
}


// Verify token validity
export async function verifyAccessToken(req: Request, res: Response) {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    const result = accessTokenService.verifyToken(token);

    if (!result.valid) {
      // Log failed token verification attempt
      await accessTokenService.logAccess({
        status: false,
        message: 'Invalid token',
        ipAddress: req.ip,
        // Attempt to extract userId and deviceId if token is decodable without verification
        ...(() => {
          try {
            const decoded: any = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
            return {
              userId: decoded.userId as string | undefined,
              deviceId: decoded.deviceId as string | undefined,
            };
          } catch {
            return {};
          }
        })(),
      });
      return res.status(401).json({ message: 'Invalid token' });
    }

    return res.json({
      valid: true,
      data: result.data
    });
  } catch (error: unknown) {
    const err = error as Error;
    return res.status(500).json({ message: `Token verification error: ${err.message}` });
  }
}
