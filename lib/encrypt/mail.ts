import CryptoJS from 'crypto-js';
import { asymmetricEncryptInstance, symmetricEncryptInstance, PostfixOfAddress } from '../base';
import { IPersonItem } from '../constants';

function generateRandom256Bits(address: string) {
    const rb = CryptoJS.lib.WordArray.random(256 / 8);
    return 'Encryption key of this mail from ' + address + ' is ' + rb.toString(CryptoJS.enc.Base64);
}

export const createEncryptedMailKey = async (publicKey: string, address: string, randomBits?: string) => {
    if (!address) {
        throw new Error('No address of current user, please check');
    }
    if (!publicKey || publicKey?.length === 0) {
        throw new Error('error: !pKey || pKey?.length === 0');
    }
    randomBits = randomBits || generateRandom256Bits(address);
    return {
        key: await asymmetricEncryptInstance.encrypt(randomBits, publicKey),
        randomBits,
    };
};

/**
 * Get RandomBits
 * @param encryptedMailKey 非对称加密之后的randomBits
 * @param privateKey
 * @returns randomBits
 */
export const decryptMailKey = async (encryptedMailKey: string, privateKey: string) => {
    return asymmetricEncryptInstance.decrypt(encryptedMailKey, privateKey);
};

export const concatAddress = (item: IPersonItem) => (item?.name ?? '') + ' ' + '<' + item.address + '>';

export const encryptMailContent = (mailContent: string, key: string) => {
    return symmetricEncryptInstance.encrypt(mailContent, key);
};

export const decryptMailContent = (encryptedMailContent: string, key: string) => {
    return symmetricEncryptInstance.decrypt(encryptedMailContent, key);
};

export const encryptMailAttachment = (mailAttachment: CryptoJS.lib.WordArray, key: string) => {
    return symmetricEncryptInstance.encrypt(mailAttachment, key);
};

export const decryptMailAttachment = (encryptedMailAttachment: string, key: string) => {
    return symmetricEncryptInstance.decryptToWordArray(encryptedMailAttachment, key);
};

// TODO 所有的邮件相关的加密解密都放在这里
