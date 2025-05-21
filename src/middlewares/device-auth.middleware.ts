import { Request, Response, NextFunction } from 'express';
const prisma = require('../prisma/prisma-client');
const deviceService = require('../services/device.service');

export async function authenticateDevice(req: Request, res: Response, next: NextFunction) {
  try {
    // Extract API key from header
    const apiKey = req.headers['x-device-api-key'] as string;
    console.log("here", apiKey)
    if (!apiKey) {
      return res.status(401).json({ message: 'Device API key is required' });
    }


    // Check if device exists and is active
    const device = await deviceService.findOne(apiKey)

    if (!device) {
      return res.status(401).json({ message: 'Invalid or inactive device' });
    }
    // Add device to request object for later use
    req.body.deviceId = device.id;

    next();

  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Error authenticating device', error: error });
  }
}

// Middleware to verify user is registered with the device
export async function verifyUserDevice(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req.body;
    const deviceId = req.body.deviceId;

    if (!userId || !deviceId) {
      return res.status(400).json({ message: 'User ID and Device ID are required' });
    }

    // Check if user is associated with this device
    const userDevice = await prisma.userDevice.findUnique({
      where: {
        userId_deviceId: {
          userId,
          deviceId
        }
      }
    });

    if (!userDevice || userDevice.revoked) {
      return res.status(403).json({ message: 'User not authorized for this device' });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: 'Error verifying user-device relationship', error });
  }
}
