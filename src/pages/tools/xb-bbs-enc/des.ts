import { DES, ECB, Hex, Pkcs7, Utf8 } from 'crypto-es';

/**
 * 与原页面 xb-encrypt-js.html 保持一致：
 * DES / ECB / PKCS7，密钥用 Utf8.parse，密文为 hex。
 */
export function encryptByDES(key: string, message: string): string {
  const keyHex = Utf8.parse(key);
  const encrypted = DES.encrypt(message, keyHex, {
    mode: ECB,
    padding: Pkcs7,
  });
  return encrypted.ciphertext.toString();
}

export function decryptByDESModeECB(key: string, ciphertext: string): string {
  const hex = ciphertext.trim().replace(/\s+/g, '');
  if (!hex) {
    return '';
  }
  if (!/^[0-9a-f]+$/i.test(hex) || hex.length % 2 !== 0) {
    throw new Error('invalid hex ciphertext');
  }

  const keyHex = Utf8.parse(key);
  const decrypted = DES.decrypt(
    {
      ciphertext: Hex.parse(hex),
    },
    keyHex,
    {
      mode: ECB,
      padding: Pkcs7,
    },
  );
  return decrypted.toString(Utf8);
}
