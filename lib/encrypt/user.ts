import crypto from 'crypto';
import keccak256 from 'keccak256';
import { ethers } from 'ethers';
import { ExternalProvider } from '@ethersproject/providers';

import { asymmetricEncryptInstance, symmetricEncryptInstance } from '../base';

interface IKeyPackParams {
    addr: string;
    date: string;
    salt: string;
    encryption_public_key: string;
    encryption_private_key: string;
    data: string;
}

const keyPack = (keyData: IKeyPackParams) => {
    const { addr, date, salt, encryption_public_key, encryption_private_key, data } = keyData;
    const parts = [
        'Addr: ' + addr,
        'Date: ' + date,
        'Salt: ' + salt,
        'Encryption-Public-Key: ' + encryption_public_key,
        'Encryption-Private-Key: ' + encryption_private_key,
        'Data: ' + data,
    ];
    return parts.join('\n');
};

export const generateEncryptionUserKey = async (address?: string) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum as ExternalProvider, 'any');
    const signer = provider.getSigner();
    const salt = crypto.randomBytes(256).toString('hex');
    const signedSalt = await signer.signMessage(
        'Please sign this message to generate encrypted private key: \n \n' + salt
    );
    const Storage_Encryption_Key = keccak256(signedSalt).toString('hex');
    const { privateKey, publicKey } = await asymmetricEncryptInstance.generateKey();
    const Encrypted_Private_Store_Key = encryptPrivateKey(privateKey, Storage_Encryption_Key);
    const returnData = {
        salt,
        encryption_private_key: Encrypted_Private_Store_Key,
        encryption_public_key: publicKey,
        signature: '',
        data: 'this is a test',
        addr: address ? address.toString() : '',
        date: new Date().toISOString(),
    };
    const keyData = keyPack(returnData);
    const keySignature = await signer.signMessage(keyData);
    if (!keySignature) throw new Error('sign key error');
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
    const provider = new ethers.providers.Web3Provider(window.ethereum as ExternalProvider, 'any');
    const signer = provider.getSigner();
    const signedSalt = await signer.signMessage(
        'Please sign this message to generate encrypted private key: \n \n' + salt
    );
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
