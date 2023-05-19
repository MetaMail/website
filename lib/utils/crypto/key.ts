import crypto from 'crypto';
import keccak256 from 'keccak256';
import { ethers } from 'ethers';

export const pkPack = (data: any) => {
    const { addr, date, version, public_key } = data;
    let parts = ['Addr: ' + addr, 'Date: ' + date, 'Version: ' + version, 'Public-Key: ' + public_key];
    return parts.join('\n');
};

interface IKeyPackParams {
    addr: string;
    date: string;
    salt: string;
    message_encryption_public_key: string;
    message_encryption_private_key: string;
    signing_public_key: string;
    signing_private_key: string;
    data: string;
}

export const keyPack = (keyData: IKeyPackParams) => {
    const {
        addr,
        date,
        salt,
        message_encryption_public_key,
        message_encryption_private_key,
        signing_public_key,
        signing_private_key,
        data,
    } = keyData;
    const parts = [
        'Addr: ' + addr,
        'Date: ' + date,
        'Salt: ' + salt,
        'Message-Encryption-Public-Key: ' + message_encryption_public_key,
        'Message-Encryption-Private-Key: ' + message_encryption_private_key,
        'Signing-Public-Key: ' + signing_public_key,
        'Signing-Private-Key: ' + signing_private_key,
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
    const provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
    const signer = provider.getSigner();
    const salt = crypto.randomBytes(256).toString('hex');
    const signedSalt = await signer.signMessage(
        'Please sign this message to generate encrypted private key: \n \n' + salt
    );
    const Storage_Encryption_Key = keccak256(signedSalt).toString('hex');

    const keyPair = await window.crypto.subtle.generateKey(
        {
            name: 'ECDSA',
            namedCurve: 'P-256',
        },
        true,
        ['sign', 'verify']
    );
    const privateBuffer = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
    const publicBuffer = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
    const Private_Store_Key = Buffer.from(privateBuffer).toString('hex');
    const Public_Store_Key = Buffer.from(publicBuffer).toString('hex');
    const Encrypted_Private_Store_Key = CryptoJS.AES.encrypt(Private_Store_Key, Storage_Encryption_Key).toString();
    const returnData = {
        salt,
        signing_private_key: Encrypted_Private_Store_Key,
        message_encryption_private_key: Encrypted_Private_Store_Key,
        signing_public_key: Public_Store_Key,
        message_encryption_public_key: Public_Store_Key,
        signature: '',
        data: 'this is a test',
    };
    const keyData = keyPack({
        ...returnData,
        addr: address ? address.toString() : '',
        date: new Date().toISOString(),
    });
    const keySignature = await signer.signMessage(keyData);
    if (!keySignature) throw new Error('sign key error');
    returnData.signature = keySignature;
    return returnData;
};
