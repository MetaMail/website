import crypto from 'crypto';
import keccak256 from 'keccak256';

import { asymmetricEncryptInstance, symmetricEncryptInstance } from '../base';
import { saltSignInstance, keyDataSignInstance } from 'lib/sign';

export const generateEncryptionUserKey = async () => {
    const salt = crypto.randomBytes(256).toString('hex');
    const signedSalt = await saltSignInstance.doSign({
        hint: 'Sign this salt to generate encryption key',
        salt: salt,
    });
    const Storage_Encryption_Key = keccak256(signedSalt).toString('hex');
    const { privateKey, publicKey } = await asymmetricEncryptInstance.generateKey();
    const Encrypted_Private_Store_Key = encryptPrivateKey(privateKey, Storage_Encryption_Key);

    const signMessages = {
        salt: salt,
        encryption_private_key: Encrypted_Private_Store_Key,
        encryption_public_key: publicKey,
        date: new Date().toISOString(),
    };

    const keySignature = await keyDataSignInstance.doSign(signMessages);
    const lastSignData = keyDataSignInstance.getLastSignData();
    const reqMessage = {
        signature: keySignature,
        data: JSON.stringify(lastSignData),
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
    const signedSalt = await saltSignInstance.doSign({
        salt: salt,
        hint: 'Sign this salt to generate encryption key',
    });
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
