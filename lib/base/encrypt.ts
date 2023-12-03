import CryptoJS from 'crypto-js';

// 对称加密
class MMSymmetricCryptoJSEncrypt {
    private _key: string;

    constructor(key?: string) {
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

export const symmetricCryptoJSEncryptInstance = new MMSymmetricCryptoJSEncrypt();

class MMSymmetricWebAPIEncrypt {
    async encrypt(data: string, secretKey: CryptoKey): Promise<string> {
        const encrypted = await window.crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                // 创建一个全零的 12 字节 ArrayBuffer。因为每次加密的 data（即 randomBits）都是随机值，因此不需要随机 iv。
                iv: new Uint8Array(12),
            },
            secretKey,
            Buffer.from(data, 'utf-8')
        );
        return Buffer.from(encrypted).toString('hex');
    }

    async decrypt(data: string, secretKey: CryptoKey): Promise<string> {
        const decrypted = await window.crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: new Uint8Array(12),
            },
            secretKey,
            Buffer.from(data, 'hex')
        );
        return Buffer.from(decrypted).toString();
    }
}

export const symmetricWebAPIEncryptInstance = new MMSymmetricWebAPIEncrypt();

// 非对称加密
class MMECDH {
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
                name: 'ECDH',
                namedCurve: 'P-384',
            },
            true,
            ['deriveKey']
        );
        const publicBuffer = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
        this._publicKey = Buffer.from(publicBuffer).toString('hex');
        const privateBuffer = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
        this._privateKey = Buffer.from(privateBuffer).toString('hex');

        return {
            privateKey: this._privateKey,
            publicKey: this._publicKey,
        };
    }
}
export const ecdh = new MMECDH();
// 通过这个函数，把我自己的私钥和对方的公钥，生成一个密钥
export async function deriveSecretKey(privateKey: string, publicKey: string) {
    try {
        const privateCryptoKey = await window.crypto.subtle.importKey(
            'pkcs8',
            Buffer.from(privateKey, 'hex'),
            { name: 'ECDH', namedCurve: 'P-384' },
            false,
            ['deriveKey']
        );
        const publicCryptoKey = await window.crypto.subtle.importKey(
            'spki',
            Buffer.from(publicKey, 'hex'),
            { name: 'ECDH', namedCurve: 'P-384' },
            false,
            []
        );
        const derivedSecretKey = await window.crypto.subtle.deriveKey(
            {
                name: 'ECDH',
                public: publicCryptoKey,
            },
            privateCryptoKey,
            {
                name: 'AES-GCM',
                length: 256,
            },
            false,
            ['encrypt', 'decrypt']
        );
        return derivedSecretKey;
    } catch (e) {
        console.log(e);
    }
}
