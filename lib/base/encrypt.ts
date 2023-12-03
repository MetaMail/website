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
class MMAsymmetricEncrypt extends MMEncrypt {
  private _publicKey: string; // hex string
  private _privateKey: string; // hex string

  set publicKey(value: string) {
    this._publicKey = value;
  }

  set privateKey(value: string) {
    this._privateKey = value;
  }

  async encrypt(data: string, publicKey?: string): Promise<string> {
    try {
      // incoming data is hex string
      const publicKeyBuffer = Buffer.from(publicKey || this._publicKey, 'hex');
      const publicCryptoKey = await window.crypto.subtle.importKey(
        'spki',
        publicKeyBuffer,
        { name: 'RSA-OAEP', hash: { name: 'SHA-256' } },
        false,
        ['encrypt']
      );
      const randomBitsBuffer = Buffer.from(data, 'utf-8');
      const encryptData = await window.crypto.subtle.encrypt(
        { name: 'RSA-OAEP' },
        publicCryptoKey,
        randomBitsBuffer
      );
      return Buffer.from(encryptData).toString('hex');
    } catch (error) {
      console.log(error);
      throw new Error('Asymmetric encrypt error');
    }
  }

  async decrypt(data: string, privateKey?: string): Promise<string> {
    try {
      // incoming data is hex string
      const privateKeyBuffer = Buffer.from(privateKey || this._privateKey, 'hex');
      const privateCryptoKey = await window.crypto.subtle.importKey(
        'pkcs8',
        privateKeyBuffer,
        { name: 'RSA-OAEP', hash: { name: 'SHA-256' } },
        false,
        ['decrypt']
      );
      const decryptBuffer = await window.crypto.subtle.decrypt(
        { name: 'RSA-OAEP' },
        privateCryptoKey,
        Buffer.from(data, 'hex')
      );
      return Buffer.from(decryptBuffer).toString();
    } catch (error) {
      console.error(error);
      throw new Error('Asymmetric decrypt error');
    }
  }

  async generateKey() {
    console.log('执行生成key对')
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
    console.log('执行生成key对', {
      privateKey: this._privateKey,
      publicKey: this._publicKey,
    })
    return {
      privateKey: this._privateKey,
      publicKey: this._publicKey,
    };

  }

}
export const asymmetricEncryptInstance = new MMAsymmetricEncrypt()
// 通过这个函数，把我自己的私钥和对方的公钥，生成一个密钥
export async function deriveSecretKey(privateKey: string, publicKey: string) {
  console.log('privateKey', privateKey)
  console.log('publicKey', publicKey)
  try {
    const publicKeyBuffer = Buffer.from(publicKey, 'hex');
    console.log('publicKeyBuffer', publicKeyBuffer)
    const publicCryptoKey = await window.crypto.subtle.importKey(
      'spki',
      publicKeyBuffer,
      { name: 'ECDH', hash: { name: 'SHA-256' } },
      false,
      ['encrypt']
    );
    console.log('publicCryptoKey', publicCryptoKey)
    const privateKeyBuffer = Buffer.from(privateKey, 'hex');
    const privateCryptoKey = await window.crypto.subtle.importKey(
      'pkcs8',
      privateKeyBuffer,
      { name: 'ECDH', hash: { name: 'SHA-256' } },
      false,
      ['decrypt']
    );
    console.log('privateKeyBuffer', privateKeyBuffer)

    return window.crypto.subtle.deriveKey(
      {
        name: "ECDH",
        public: publicCryptoKey,
      },
      privateCryptoKey,
      {
        name: "AES-GCM",
        length: 256,
      },
      false,
      ["encrypt", "decrypt"]
    );
  } catch (e) {
    console.error(e)
  }
}
