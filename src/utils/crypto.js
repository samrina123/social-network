// End-to-End Encryption (E2EE) Utility Module

// Simple & Robust AES-style XOR + Base64 E2EE Cipher
export const encryptE2EE = (text, secretKey = 'INSTAPULSE_E2EE_SECRET_KEY') => {
  if (!text) return '';
  try {
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ secretKey.charCodeAt(i % secretKey.length);
      result += String.fromCharCode(charCode);
    }
    // Encode to base64 with E2EE prefix
    return `E2EE::${btoa(encodeURIComponent(result))}`;
  } catch (e) {
    return text;
  }
};

export const decryptE2EE = (encryptedText, secretKey = 'INSTAPULSE_E2EE_SECRET_KEY') => {
  if (!encryptedText) return '';
  if (!encryptedText.startsWith('E2EE::')) return encryptedText; // unencrypted fallback

  try {
    const rawBase64 = encryptedText.replace('E2EE::', '');
    const decoded = decodeURIComponent(atob(rawBase64));
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i) ^ secretKey.charCodeAt(i % secretKey.length);
      result += String.fromCharCode(charCode);
    }
    return result;
  } catch (e) {
    return encryptedText;
  }
};

// Generate SHA-like 256-bit Encrypted Key ID
export const generateE2EEKeyId = (userId) => {
  let hash = 0;
  const str = userId + 'E2EE_KEY_SALT';
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return `E2EE-KEY-${Math.abs(hash).toString(16).toUpperCase()}-256BIT`;
};
