import { ethers } from 'ethers';
import { ExternalProvider } from '@ethersproject/providers';
import keccak256 from 'keccak256';

import { MetaMailTypeEn } from 'lib/constants';
import { createDraft } from 'lib/http';
import { getPrivateKeyFromLocal, getUserInfo, saveUserInfo, setRandomBits } from 'lib/storage';

export function generateRandom256Bits(address: string) {
    const rb = CryptoJS.lib.WordArray.random(256 / 8);
    return 'Encryption key of this mail from ' + address + ' is ' + rb.toString(CryptoJS.enc.Base64);
}

export const createMail = async (type: MetaMailTypeEn) => {
    let key;
    if (type === MetaMailTypeEn.Encrypted) {
        const { publicKey, address } = getUserInfo();
        if (!address) {
            console.warn('No address of current user, please check');
            return;
        }
        if (!publicKey || publicKey?.length === 0) {
            console.log('error: !pKey || pKey?.length === 0');
            return;
        }

        const randomBits = generateRandom256Bits(address);
        key = CryptoJS.AES.encrypt(randomBits, publicKey).toString();
    } else {
        setRandomBits(undefined);
    }
    if (type === MetaMailTypeEn.Encrypted && (!key || key?.length === 0)) {
        return;
    }
    const { message_id } = await createDraft(type, key);

    return message_id;
};

export const getPrivateKey = async () => {
    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum as ExternalProvider, 'any');
        const signer = provider.getSigner();
        const encryptedPrivateKey = getPrivateKeyFromLocal();
        if (!encryptedPrivateKey || encryptedPrivateKey.length == 0) {
            throw new Error('error: no privateKey in sesssion storage');
        }
        // @ts-ignore
        const salt = getSaltFromLocal();
        if (!salt || salt.length == 0) {
            throw new Error('error: no privateKey in sesssion storage');
        }
        const signedSalt = await signer.signMessage(
            'Please sign this message to generate encrypted private key: \n \n' + salt
        );
        const Storage_Encryption_Key = keccak256(signedSalt).toString('hex');
        const privateKey = CryptoJS.AES.decrypt(encryptedPrivateKey, Storage_Encryption_Key).toString(
            CryptoJS.enc.Utf8
        );
        return privateKey;
    } catch (e) {
        console.log(e);
    }
};
