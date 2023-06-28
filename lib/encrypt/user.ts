import crypto from 'crypto';
import keccak256 from 'keccak256';

import { asymmetricEncryptInstance, symmetricEncryptInstance } from '../base';
import { saltSignInstance, keyDataSignInstance } from 'lib/sign';

export const generateEncryptionUserKey = async () => {
    const salt = crypto.randomBytes(256).toString('hex');
    const saltSignData = {
        signMethod: 'eth_signTypedData',
        domain: { name: 'MetaMail', version: '1.0.0' },
        signTypes: {
            Message: [
                { name: 'title', type: 'string' },
                { name: 'content', type: 'string' },
            ],
        },
        signMessages: {
            title: 'Sign this salt to generate encryption key',
            content: salt,
        },
    };
    const signedSalt = await saltSignInstance.doSign(saltSignData);
    const Storage_Encryption_Key = keccak256(signedSalt).toString('hex');
    const { privateKey, publicKey } = await asymmetricEncryptInstance.generateKey();
    const Encrypted_Private_Store_Key = encryptPrivateKey(privateKey, Storage_Encryption_Key);

    const returnData = {
        salt: salt,
        encryption_private_key: Encrypted_Private_Store_Key,
        encryption_public_key: publicKey,
        data: 'TODO: add meta data',
        date: new Date().toISOString(),
        signature: '',
    };

    const keyDataSignData = {
        signMethod: 'eth_signTypedData',
        domain: { name: 'MetaMail', version: '1.0.0' },
        signTypes: {
            Message: [
                { name: 'date', type: 'string' },
                { name: 'data', type: 'string' },
                { name: 'salt', type: 'string' },
                { name: 'encryption_private_key', type: 'string' },
                { name: 'encryption_public_key', type: 'string' },
            ],
        },
        signMessages: {
            salt: returnData.salt,
            encryption_private_key: returnData.encryption_private_key,
            encryption_public_key: returnData.encryption_public_key,
            data: returnData.data,
            date: returnData.date,
        },
    };

    const keySignature = await keyDataSignInstance.doSign(keyDataSignData);
    returnData.signature = keySignature;
    return returnData;
};

export const getPrivateKey = async (encryptedPrivateKey: string, salt: string) => {
    if (!encryptedPrivateKey || encryptedPrivateKey.length == 0) {
        throw new Error('error: no privateKey in session storage');
    }
    if (!salt || salt.length == 0) {
        throw new Error('error: no salt in session storage');
    }
    const signedSalt = await saltSignInstance.doSign(salt);
    const Storage_Encryption_Key = keccak256(signedSalt).toString('hex');
    return decryptPrivateKey(encryptedPrivateKey, Storage_Encryption_Key);
};

export const encryptPrivateKey = (privateKey: string, key: string) => {
    return symmetricEncryptInstance.encrypt(privateKey, key);
};

export const decryptPrivateKey = (encryptedPrivateKey: string, key: string) => {
    return symmetricEncryptInstance.decrypt(encryptedPrivateKey, key);
};

// TODO 所有的用户相关的加密解密都放在这里
