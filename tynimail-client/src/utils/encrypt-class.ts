import CryptoJS from "crypto-js";

const SECRET_KEY = "justwanttoaddthesecret-key-of-success";
// Encrypt data
const encryptValue = (data: any) => {
  const ciphertext = CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
  return ciphertext;
};

// Decrypt data
const decryptValue = (encryptedData: any) => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
  const originalText = bytes.toString(CryptoJS.enc.Utf8);
  return originalText;
};

export { encryptValue, decryptValue };
