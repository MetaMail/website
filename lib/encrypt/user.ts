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
            Sign_Salt: [
                { name: 'hint', type: 'string' },
                { name: 'salt', type: 'string' },
            ],
        },
        signMessages: {
            hint: 'Sign this salt to generate encryption key',
            salt: salt,
        },
    };
    const signedSalt = await saltSignInstance.doSign(saltSignData);
    const Storage_Encryption_Key = keccak256(signedSalt).toString('hex');
    const { privateKey, publicKey } = await asymmetricEncryptInstance.generateKey();
    const Encrypted_Private_Store_Key = encryptPrivateKey(privateKey, Storage_Encryption_Key);

    const signMethod = 'eth_signTypedData';
    const domain = { name: 'MetaMail', version: '1.0.0' };
    const signTypes = {
        Sign_KeyData: [
            { name: 'date', type: 'string' },
            { name: 'salt', type: 'string' },
            { name: 'encryption_private_key', type: 'string' },
            { name: 'encryption_public_key', type: 'string' },
        ],
    };

    const signMessages = {
        salt: salt,
        encryption_private_key: Encrypted_Private_Store_Key,
        encryption_public_key: publicKey,
        date: new Date().toISOString(),
    };

    const signData = {
        signMethod: signMethod,
        domain: domain,
        signTypes: signTypes,
        signMessages: signMessages,
    };

    const keySignature = await keyDataSignInstance.doSign(signData);
    const reqMessage = {
        signature: keySignature,
        data: JSON.stringify(signData),
        salt: salt,
        encryption_private_key: signMessages.encryption_private_key,
        encryption_public_key: signMessages.encryption_public_key,
        date: signMessages.date,
    };
    return reqMessage;
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
