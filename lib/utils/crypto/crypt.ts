import { ethers } from 'ethers';
import { ExternalProvider } from '@ethersproject/providers';
import keccak256 from 'keccak256';
import CryptoJS from 'crypto-js';

import { userSessionStorage } from 'lib/session-storage';

export function generateRandom256Bits(address: string) {
    const rb = CryptoJS.lib.WordArray.random(256 / 8);
    return 'Encryption key of this mail from ' + address + ' is ' + rb.toString(CryptoJS.enc.Base64);
}

export const createMailKeyWithEncrypted = async () => {
    const { publicKey, address } = userSessionStorage.getUserInfo();
    if (!address) {
        throw new Error('No address of current user, please check');
    }
    if (!publicKey || publicKey?.length === 0) {
        throw new Error('error: !pKey || pKey?.length === 0');
    }
    const randomBits = generateRandom256Bits(address);

    const publicKeyBuffer = Buffer.from(publicKey, 'hex');
    const publicCryptoKey = await window.crypto.subtle.importKey(
        'spki',
        publicKeyBuffer,
        {
            name: 'RSA-OAEP',
            hash: { name: 'SHA-256' },
        },
        false,
        ['encrypt']
    );

    const randomBitsBuffer = Buffer.from(randomBits, 'utf-8');
    const encryptData = await window.crypto.subtle.encrypt(
        {
            name: 'RSA-OAEP',
        },
        publicCryptoKey,
        randomBitsBuffer
    );
    const returnStr = Buffer.from(encryptData).toString('hex');
    return returnStr;
};

export const getPrivateKey = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum as ExternalProvider, 'any');
    const signer = provider.getSigner();
    const encryptedPrivateKey = userSessionStorage.getPrivateKeyFromLocal();
    if (!encryptedPrivateKey || encryptedPrivateKey.length == 0) {
        throw new Error('error: no privateKey in sesssion storage');
    }
    // @ts-ignore
    const salt = userSessionStorage.getSaltFromLocal();
    if (!salt || salt.length == 0) {
        throw new Error('error: no privateKey in sesssion storage');
    }
    const signedSalt = await signer.signMessage(
        'Please sign this message to generate encrypted private key: \n \n' + salt
    );
    const Storage_Encryption_Key = keccak256(signedSalt).toString('hex');
    const privateKey = CryptoJS.AES.decrypt(encryptedPrivateKey, Storage_Encryption_Key).toString(CryptoJS.enc.Utf8);
    return privateKey;
};
