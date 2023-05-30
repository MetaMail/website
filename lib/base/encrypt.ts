import CryptoJS from 'crypto-js';
import { MMObject } from './object';

abstract class MMEncrypt extends MMObject {
    abstract encrypt(data: string): string | Promise<string>;
    abstract decrypt(data: string): string | Promise<string>;
}

const DEFAULT_AES_KEY = '0123456789abcdef'; // 密钥, AES-128 需16个字符, AES-256 需要32个字符
const DEFAULT_AES_IV = 'abcdef0123456789'; // 密钥偏移量，16个字符

// 对称加密
class MMSymmetricEncrypt extends MMEncrypt {
    private _key: CryptoJS.lib.WordArray;
    private _iv: CryptoJS.lib.WordArray;

    constructor(key?: string, iv?: string) {
        super();
        this._key = CryptoJS.enc.Utf8.parse(key || DEFAULT_AES_KEY);
        this._iv = CryptoJS.enc.Utf8.parse(iv || DEFAULT_AES_IV);
    }

    set key(value: string) {
        this._key = CryptoJS.enc.Utf8.parse(value);
    }

    set iv(value: string) {
        this._iv = CryptoJS.enc.Utf8.parse(value);
    }

    encrypt(data: string): string {
        const encrypted = CryptoJS.AES.encrypt(data, this._key, {
            iv: this._iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
        });
        return encrypted.toString();
    }

    decrypt(data: string): string {
        const decrypted = CryptoJS.AES.decrypt(data, this._key, {
            iv: this._iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
        });
        return CryptoJS.enc.Utf8.stringify(decrypted).toString();
    }
}

export const symmetricEncryptInstance = new MMSymmetricEncrypt();

// 非对称加密
class MMAsymmetricEncrypt extends MMEncrypt {
    private _publicKey: string; // hex string
    private _privateKey: string; // hex string

    async encrypt(data: string, publicKey?: string): Promise<string> {
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
