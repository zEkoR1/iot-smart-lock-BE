import crypto from 'crypto';

/**
 * Generates a secure random API key
 * @param length The length of the API key (default: 32)
 * @param prefix Optional prefix to add to the key (e.g., 'iot_')
 * @returns A secure random API key
 */
export function generateApiKey(length: number = 32, prefix: string = ''): string {
  // Generate random bytes and convert to a hex string
  const randomBytes = crypto.randomBytes(Math.ceil(length / 2));
  const randomString = randomBytes.toString('hex').slice(0, length);
  
  // Add prefix if provided
  return `${prefix}${randomString}`;
}

// Example formats:
// Default: "8a7b9c5d2e1f0a3b4c6d8e9f7a2b3c5d"
// With prefix: "iot_8a7b9c5d2e1f0a3b4c6d8e9f7a2b3c5d"
