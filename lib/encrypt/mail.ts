import CryptoJS from 'crypto-js';
import { asymmetricEncryptInstance, symmetricEncryptInstance, PostfixOfAddress, deriveSecretKey } from '../base';
import { IPersonItem } from '../constants';
import { userLocalStorage, userSessionStorage } from 'lib/utils';
import { getPrivateKey } from './user';

function generateRandom256Bits(address: string) {
  const rb = CryptoJS.lib.WordArray.random(256 / 8);
  return 'Encryption key of this mail from ' + address + ' is ' + rb.toString(CryptoJS.enc.Base64);
}

// 用自己的私钥和收件人的公钥，对称加密，生成一个用于加密randomBits的密钥
export const alicesSecretKey = async (privateKey: any, publicKey: any) => {

  return await deriveSecretKey(privateKey, publicKey)
}
// 获得原始randomBits和加密后的randomBits
export const createEncryptedMailKey = async (publicKey: string, address: string, randomBits?: string) => {
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
    purePrivateKey = await getPrivateKey(privateKey, salt);
    userSessionStorage.setPurePrivateKey(purePrivateKey);
  }
  const secretKey = await alicesSecretKey(
    purePrivateKey,
    publicKey
  )

  console.log(await symmetricEncryptInstance.encrypt(randomBits, secretKey))
  return {
    key: await symmetricEncryptInstance.encrypt(randomBits, secretKey),
    randomBits,
  };
};

/**
 * Get RandomBits
 * @param encryptedMailKey 非对称加密之后的randomBits
 * @param privateKey
 * @returns randomBits
 */
// export const decryptMailKey = async (encryptedMailKey: string, privateKey: string) => {
//     return asymmetricEncryptInstance.decrypt(encryptedMailKey, privateKey);
// };
// 获取原始的randomBits
export const decryptMailKey = async (encryptedMailKey: string, privateKey: string, publicKey: string) => {
  // rpc get alice's publicKey
  const secretKey = await deriveSecretKey(
    privateKey,
    publicKey,
  );
  // return asymmetricEncryptInstance.decrypt(encryptedMailKey, secretKey);
};
export const concatAddress = (item: IPersonItem) => (item?.name ?? '') + ' ' + '<' + item.address + '>';

export const encryptMailContent = (mailContent: string, key: string) => {
  return symmetricEncryptInstance.encrypt(mailContent, key);
};

export const decryptMailContent = (encryptedMailContent: string, key: string) => {
  return symmetricEncryptInstance.decrypt(encryptedMailContent, key);
};

export const encryptMailAttachment = (mailAttachment: CryptoJS.lib.WordArray, key: string) => {
  const encryptedBase64 = symmetricEncryptInstance.encrypt(mailAttachment, key);
  return Buffer.from(encryptedBase64, 'base64');
};

export const decryptMailAttachment = (encryptedMailAttachment: ArrayBuffer, key: string) => {
  const encryptedBase64 = Buffer.from(encryptedMailAttachment).toString('base64');
  return symmetricEncryptInstance.decryptToWordArray(encryptedBase64, key);
};

// TODO 所有的邮件相关的加密解密都放在这里
