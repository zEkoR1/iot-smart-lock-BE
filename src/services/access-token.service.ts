import jwt from 'jsonwebtoken';
import { v7 as genUuid } from 'uuid';
const prisma = require('../prisma/prisma-client');

const JWT_SECRET = process.env.JWT_SECRET || 'default-jwt-secret-for-development';

// Define interface for the log parameters
interface LogAccessParams {
  userId: string;
  deviceId: string;
  status: boolean;
  message: string;
  ipAddress?: string | null;
}

class AccessTokenService {
  private prisma: any;

  constructor(prismaClient: any) {
    this.prisma = prismaClient;
  }

  async generateAccessToken(userId: string, deviceId: string) {
    try {
      // Fetch user details and role for this device
      const userDevice = await this.prisma.userDevice.findUnique({
        where: {
          userId_deviceId: {
            userId,
            deviceId
          }
        },
        include: {
          user: {
            select: {
              id: true,
              name: true
            }
          },
          device: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      if (!userDevice) {
        throw new Error('User not authorized for this device');
      }

      // Log the access attempt
      await this.logAccess({
        userId,
        deviceId,
        status: true,
        message: 'Biometric authentication successful'
      });

      // Generate token with user, device, and role information
      const token = jwt.sign(
        {
          userId: userId,
          deviceId: deviceId,
          userRole: userDevice.role,
          userName: userDevice.user.name,
          deviceName: userDevice.device.name,
          // Add a unique jti (JWT ID) for token identification/revocation
          jti: genUuid()
        },
        JWT_SECRET,
        {
          expiresIn:'15s'
        }
      );

      return {
        token,
      };
    } catch (error) {
      console.error('Token generation error:', error);
      throw error;
    }
  }

  // Log access attempts (successful or failed)
  async logAccess({ userId, deviceId, status, message, ipAddress = null }: LogAccessParams) {
    try {
      return await this.prisma.log.create({
        data: {
          id: genUuid(),
          time: new Date(),
          status,
          message,
          ipAddress,
          userId,
          deviceId
        }
      });
    } catch (error) {
      console.error('Failed to log access attempt:', error);
      // Don't throw - we don't want logging failures to break authentication
    }
  }

  verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return { valid: true, data: decoded };
    } catch (error) {
      return { valid: false, error: 'Invalid token' };
    }
  }
}

const accessTokenService = new AccessTokenService(prisma);
module.exports = accessTokenService;
