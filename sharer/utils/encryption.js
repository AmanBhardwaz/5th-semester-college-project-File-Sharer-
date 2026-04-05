const crypto = require('crypto');

// Encryption key should be 32 bytes for AES-256
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-secret-encryption-key-32-characters-long-12345678';
const algorithm = 'aes-256-cbc';

// Ensure the key is exactly 32 bytes
const key = Buffer.from(ENCRYPTION_KEY.slice(0, 32).padEnd(32, '0'));

// Encrypt file buffer
function encryptFile(buffer) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  
  return {
    iv: iv.toString('hex'),
    encryptedData: encrypted
  };
}

// Decrypt file buffer
function decryptFile(encryptedData, ivHex) {
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  
  const decrypted = Buffer.concat([
    decipher.update(encryptedData),
    decipher.final()
  ]);
  
  return decrypted;
}

// Generate unique file ID
function generateFileId() {
  return crypto.randomBytes(16).toString('hex');
}

module.exports = {
  encryptFile,
  decryptFile,
  generateFileId
};
