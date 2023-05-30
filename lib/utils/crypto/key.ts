import crypto from 'crypto';
import keccak256 from 'keccak256';
import CryptoJS from 'crypto-js';
import { ethers } from 'ethers';
import { ExternalProvider } from '@ethersproject/providers';

export const pkPack = (data: any) => {
    const { addr, date, version, public_key } = data;
    let parts = ['Addr: ' + addr, 'Date: ' + date, 'Version: ' + version, 'Public-Key: ' + public_key];
    return parts.join('\n');
};

interface IKeyPackParams {
    addr: string;
    date: string;
    salt: string;
    encryption_public_key: string;
    encryption_private_key: string;
    data: string;
}

export const keyPack = (keyData: IKeyPackParams) => {
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

export const getPublicKey = async (account: string) => {
    // @ts-ignore
    return ethereum.request({
        method: 'eth_getEncryptionPublicKey',
        params: [account],
    });
};

export const generateEncryptionKey = async (address?: string) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum as ExternalProvider, 'any');
    const signer = provider.getSigner();
    const salt = crypto.randomBytes(256).toString('hex');
    const signedSalt = await signer.signMessage(
        'Please sign this message to generate encrypted private key: \n \n' + salt
    );
    const Storage_Encryption_Key = keccak256(signedSalt).toString('hex');

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
    const Private_Store_Key = Buffer.from(privateBuffer).toString('hex');
    const Public_Store_Key = Buffer.from(publicBuffer).toString('hex');
    const Encrypted_Private_Store_Key = CryptoJS.AES.encrypt(Private_Store_Key, Storage_Encryption_Key).toString();
    const returnData = {
        salt,
        encryption_private_key: Encrypted_Private_Store_Key,
        encryption_public_key: Public_Store_Key,
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
