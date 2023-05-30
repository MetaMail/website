import CryptoJS from 'crypto-js';
import { asymmetricEncryptInstance, PostfixOfAddress } from '../base';
import { IPersonItem } from '../constants';

function generateRandom256Bits(address: string) {
    const rb = CryptoJS.lib.WordArray.random(256 / 8);
    return 'Encryption key of this mail from ' + address + ' is ' + rb.toString(CryptoJS.enc.Base64);
}

export const createEncryptedMailKey = async (publicKey: string, address: string) => {
    if (!address) {
        throw new Error('No address of current user, please check');
    }
    if (!publicKey || publicKey?.length === 0) {
        throw new Error('error: !pKey || pKey?.length === 0');
    }
    const randomBits = generateRandom256Bits(address);
    return asymmetricEncryptInstance.encrypt(randomBits, publicKey);
};

export const decryptEncryptedMailKey = async (encryptedMailKey: string, privateKey: string) => {
    return asymmetricEncryptInstance.decrypt(encryptedMailKey, privateKey);
};

const concatAddress = (item: IPersonItem) => (item?.name ?? '') + ' ' + '<' + item.address + '>';

export const metaPack = async (data: {
    from: string;
    to: IPersonItem[];
    cc?: IPersonItem[];
    date?: string;
    subject?: string;
    text_hash: string;
    html_hash: string;
    attachments_hash?: string[];
    name?: string;
    keys?: string[];
}) => {
    const { from, to, cc, date, subject, text_hash, html_hash, attachments_hash, name, keys } = data;

    let parts = [
        'From: ' +
            concatAddress({
                address: from + PostfixOfAddress,
                name: name ?? '',
            }),
        'To: ' + to.map(concatAddress).join(', '),
    ];
    if (cc && cc?.length >= 1) {
        parts.push('Cc: ' + cc?.map(concatAddress).join(', '));
    }
    parts = parts.concat([
        'Date: ' + date,
        'Subject: ' + subject,
        'Content-Hash: ' + text_hash + ' ' + html_hash,
        'Attachments-Hash: ' + attachments_hash?.join(' '),
    ]);

    if (Array.isArray(keys) && keys.length > 0) {
        parts.push('Keys: ' + keys.join(' '));
    }

    return Promise.resolve({
        packedResult: parts.join('\n'),
    });
};
