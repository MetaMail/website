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
        const encryptData = await window.crypto.subtle.encrypt({ name: 'RSA-OAEP' }, publicCryptoKey, randomBitsBuffer);
        return Buffer.from(encryptData).toString('hex');
    }

    async decrypt(data: string, privateKey?: string): Promise<string> {
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
    }

    async generateKey() {
        const keyPair = await window.crypto.subtle.generateKey(
            {
                name: 'RSA-OAEP',
                modulusLength: 2048,
                publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
                hash: { name: 'SHA-256' },
            },
            true,
            ['encrypt', 'decrypt']
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

export const asymmetricEncryptInstance = new MMAsymmetricEncrypt();
