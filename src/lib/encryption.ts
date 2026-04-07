import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'default_secret_key_change_this_in_production';

export const encrypt = (text: string): string => {
    return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
};

export const decrypt = (cipherText: string): string => {
    const bytes = CryptoJS.AES.decrypt(cipherText, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
};

// Deterministic hash for searching encrypted fields
export const generateSearchToken = (text: string): string => {
    return CryptoJS.SHA256(text.toLowerCase().trim()).toString();
};
