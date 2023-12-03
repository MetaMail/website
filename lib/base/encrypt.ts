import CryptoJS from 'crypto-js';
import { MMObject } from './object';

abstract class MMEncrypt extends MMObject {
  abstract encrypt(data: string): string | Promise<string>;
  abstract decrypt(data: string): string | Promise<string>;
}

// 对称加密
class MMSymmetricEncrypt extends MMEncrypt {
  private _key: string;

  constructor(key?: string) {
    super();
    this._key = key;
  }

  set key(value: string) {
    this._key = value;
  }

  encrypt(data: string | CryptoJS.lib.WordArray, key?: string): string {
    const encrypted = CryptoJS.AES.encrypt(data, key || this._key);
    return encrypted.toString();
  }

  decrypt(data: string, key?: string): string {
    const decrypted = CryptoJS.AES.decrypt(data, key || this._key);
    return CryptoJS.enc.Utf8.stringify(decrypted).toString();
  }

  decryptToWordArray(data: string, key?: string) {
    return CryptoJS.AES.decrypt(data, key || this._key);
  }
}

export const symmetricEncryptInstance = new MMSymmetricEncrypt();

// 非对称加密
class MMAsymmetricEncrypt {
  private _publicKey: string; // hex string
  private _privateKey: string; // hex string

  set publicKey(value: string) {
    this._publicKey = value;
  }

  set privateKey(value: string) {
    this._privateKey = value;
  }

  async generateKey() {
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: "ECDH",
        namedCurve: "P-384",
      },
      true,
      ["deriveKey"],
    );
    const privateBuffer = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
    const publicBuffer = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
    this._privateKey = Buffer.from(privateBuffer).toString('hex');
    this._publicKey = Buffer.from(publicBuffer).toString('hex');

    return {
      privateKey: this._privateKey,
      publicKey: this._publicKey,
    };

  }

}
export const asymmetricEncryptInstance = new MMAsymmetricEncrypt()
// 通过这个函数，把我自己的私钥和对方的公钥，生成一个密钥
export async function deriveSecretKey(privateKey: string, publicKey: string) {

  try {
    const publicKeyBuffer = Buffer.from(publicKey, 'hex');
    // console.log('publicKeyBuffer', publicKeyBuffer)
    const publicCryptoKey = await window.crypto.subtle.importKey(
      'spki',
      publicKeyBuffer,
      { name: 'ECDH', namedCurve: "P-384" },
      false,
      ['encrypt']
    );
    const privateKeyBuffer = Buffer.from(privateKey, 'hex');
    const privateCryptoKey = await window.crypto.subtle.importKey(
      'pkcs8',
      privateKeyBuffer,
      { name: 'ECDH', namedCurve: "P-384" },
      false,
      ['decrypt']
    );
    const derivedKey = await window.crypto.subtle.deriveKey(
      {
        name: "ECDH",
        public: publicCryptoKey,
      },
      privateCryptoKey,
      {
        name: "AES-GCM",
        length: 256,
      },
      true,
      ["encrypt", "decrypt"]
    );

    const secretKeyBuffer = await window.crypto.subtle.exportKey('raw', derivedKey)
    console.log('@@@', Buffer.from(secretKeyBuffer).toString('hex'))
    return Buffer.from(secretKeyBuffer).toString('hex');
  } catch (e) {
    console.error(e)
  }
}
