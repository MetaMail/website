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

    const hashedPrivateKey = crypto.createHash('sha256').update(Encrypted_Private_Store_Key).digest('hex');
    const hashedPublicKey = crypto.createHash('sha256').update(publicKey).digest('hex');

    const signMessages = {
        salt: salt,
        private_key_hash: hashedPrivateKey,
        public_key_hash: hashedPublicKey,
        date: new Date().toISOString(),
    };

    const keySignature = await keyDataSignInstance.doSign(signMessages);
    const reqMessage = {
        signature: keySignature,
        salt: salt,
        encryption_private_key: Encrypted_Private_Store_Key,
        encryption_public_key: publicKey,
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
