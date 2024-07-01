import CryptoJS from 'crypto-js';
import { symmetricWebAPIEncryptInstance, symmetricCryptoJSEncryptInstance, deriveSecretKey } from '../base';
import { IPersonItem } from '../constants';
import { userLocalStorage, userSessionStorage } from 'lib/utils';
import { getPrivateKey } from './user';
import { useSignatureModalStore } from 'lib/zustand-store';
function generateRandom256Bits(address: string) {
  const rb = CryptoJS.lib.WordArray.random(256 / 8);
  return 'Encryption key of this mail from ' + address + ' is ' + rb.toString(CryptoJS.enc.Base64);
}

// 获得原始randomBits和加密后的randomBits
export const createEncryptedMailKey = async (publicKey: string, address: string, randomBits?: string, signModalMessage?: string) => {
  const { handleShowSignature, setIsShowSignature } = useSignatureModalStore.getState();
  if (!address) {
    throw new Error('No address of current user, please check');
  }
  if (!publicKey || publicKey?.length === 0) {
    throw new Error('error: !pKey || pKey?.length === 0');
  }
  randomBits = randomBits || generateRandom256Bits(address);
  let purePrivateKey = userSessionStorage.getPurePrivateKey();
  if (!purePrivateKey) {
    const { privateKey, salt } = userLocalStorage.getUserInfo();
    // console.log('4444', signModalMessage)
    handleShowSignature(signModalMessage)
    purePrivateKey = await getPrivateKey(privateKey, salt);
    userSessionStorage.setPurePrivateKey(purePrivateKey);
    setIsShowSignature(false)
  }
  const secretKey = await deriveSecretKey(purePrivateKey, publicKey);
  return {
    encrypted_encryption_key: await symmetricWebAPIEncryptInstance.encrypt(randomBits, secretKey),
    randomBits,
  };
};

/**
 * Get RandomBits
 * @param encryptedMailKey 非对称加密之后的randomBits
 * @param privateKey
 * @returns randomBits
 */
// 获取原始的randomBits
export const decryptMailKey = async (encryptedMailKey: string, privateKey: string, publicKey: string) => {
  const secretKey = await deriveSecretKey(privateKey, publicKey);
  return symmetricWebAPIEncryptInstance.decrypt(encryptedMailKey, secretKey);
};
export const concatAddress = (item: IPersonItem) => (item?.name ?? '') + ' ' + '<' + item.address + '>';

export const encryptMailContent = (mailContent: string, key: string) => {
  return symmetricCryptoJSEncryptInstance.encrypt(mailContent, key);
};

export const decryptMailContent = (encryptedMailContent: string, key: string) => {
  return symmetricCryptoJSEncryptInstance.decrypt(encryptedMailContent, key);
};

export const encryptMailAttachment = (mailAttachment: CryptoJS.lib.WordArray, key: string) => {
  const encryptedBase64 = symmetricCryptoJSEncryptInstance.encrypt(mailAttachment, key);
  return Buffer.from(encryptedBase64, 'base64');
};

export const decryptMailAttachment = (encryptedMailAttachment: ArrayBuffer, key: string) => {
  const encryptedBase64 = Buffer.from(encryptedMailAttachment).toString('base64');
  return symmetricCryptoJSEncryptInstance.decryptToWordArray(encryptedBase64, key);
};

// TODO 所有的邮件相关的加密解密都放在这里
