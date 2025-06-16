const prisma = require('../prisma/prisma-client');
const { BIOMETRIC_URL } = process.env;


class BiometricService {
  private prisma: any;

  constructor(prismaClient: any) {
    this.prisma = prismaClient;
  }

   async matchBiometrics(faceHash : string) {
    const res = await fetch(`${BIOMETRIC_URL}/face_id`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ faceHash, user.face }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Biometric svc error ${res.status}: ${text}`);
    }
    // Expecting JSON: { match: boolean }
    const { match } = await res.json();
    return match;
  }




  async verifyBiometrics(fingerprintHash: string, faceHash: string) {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
            { fingerprint: fingerprintHash },
          
      }
      });
      
      const faceIs = await this.matchBiometrics(faceHash, user.face);
        
      if (!user || !faceIs) {
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
