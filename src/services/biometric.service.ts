const prisma = require('../prisma/prisma-client');

class BiometricService {
  private prisma: any;

  constructor(prismaClient: any) {
    this.prisma = prismaClient;
  }

  // Process external biometric service response
  async verifyBiometrics(fingerprintHash: string, faceHash: string) {
    try {
      // Find user with matching biometric data
      // Both fingerprint AND face must match
      const user = await this.prisma.user.findFirst({
        where: {
          AND: [
            { fingerprint: fingerprintHash },
            { face: faceHash }
          ]
        }
      });

      if (!user) {
        return { success: false, message: 'Biometric verification failed' };
      }

      return { 
        success: true, 
        userId: user.id,
        name: user.name
      };
    } catch (error) {
      console.error('Biometric verification error:', error);
      throw new Error('Failed to verify biometric data');
    }
  }

  // Mock method to simulate external service hashing
  // In a real app, this would call your external service
  async getHashFromExternalService(biometricData: string, type: 'fingerprint' | 'face') {
    // This is a placeholder - your actual implementation would call the external service
    // that converts the biometric data to a hash
    
    // Simulating async external API call
    return new Promise<string>((resolve) => {
      setTimeout(() => {
        // This is just for simulation purposes
        const hash = Buffer.from(`${biometricData}-${type}-hash`).toString('base64');
        resolve(hash);
      }, 100);
    });
  }
}

const biometricService = new BiometricService(prisma);
module.exports = biometricService;
