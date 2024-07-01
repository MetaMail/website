import crypto from 'crypto';
import keccak256 from 'keccak256';

import { ecdh, symmetricCryptoJSEncryptInstance } from '../base';
import { saltSignInstance, keyDataSignInstance } from 'lib/sign';
import { useThreeSignatureModalStore } from 'lib/zustand-store';
// 获取用户的密钥对(目前只有welcome使用)
export const generateEncryptionUserKey = async () => {
  const { setActiveStep } = useThreeSignatureModalStore.getState();
  const salt = crypto.randomBytes(32).toString('hex');
  let signedSalt;
  try {
    console.log('第二步骤')

    signedSalt = await saltSignInstance.doSign({
      salt: salt,
      hint: 'Sign this salt to generate encryption key',
    });
    setActiveStep(2);
  } catch (error) {
    // Handle the case where signing is refused by the user
    // Throw a new error or handle it in a way that your application expects
    throw new Error('error: User refused to sign the salt');
  }
  const Storage_Encryption_Key = keccak256(signedSalt).toString('hex');
  const { privateKey, publicKey } = await ecdh.generateKey();
  // 把自己的私钥，用Storage_Encryption_Key对称加密了一下
  const Encrypted_Private_Store_Key = encryptPrivateKey(privateKey, Storage_Encryption_Key);

  const keysMeta = {
    name: 'ECDH',
    named_curve: 'P-384',
    private_key_format: 'pkcs8',
    public_key_format: 'spki',
    private_key_encoding: 'hex',
    public_key_encoding: 'hex',
    key_usages: ['deriveKey'],
    derived_key_name: 'AES-GCM',
  };

  const public_key_hash = crypto.createHash('sha256').update(publicKey).digest('hex');
  const encrypted_private_key_hash = crypto.createHash('sha256').update(Encrypted_Private_Store_Key).digest('hex');
  const keys_hash = crypto.createHash('sha256').update(public_key_hash + encrypted_private_key_hash).digest('hex');
  const signMessages = {
    salt: salt,
    keys_hash: keys_hash,
    keys_meta: JSON.stringify(keysMeta), // stringifying the key meta object
    date: new Date().toISOString(),
  };

  const keySignature = await keyDataSignInstance.doSign(signMessages);
  const reqMessage = {
    signature: keySignature,
    salt: salt,
    encrypted_private_key: Encrypted_Private_Store_Key,
    public_key: publicKey,
    keys_meta: JSON.stringify(keysMeta),
    date: signMessages.date,
  };
  return reqMessage;
};
// 解密出经过对称加密的用户私钥
export const getPrivateKey = async (encryptedPrivateKey: string, salt: string) => {
  if (!encryptedPrivateKey || encryptedPrivateKey.length == 0) {
    throw new Error('error: no privateKey in session storage');
  }
  if (!salt || salt.length == 0) {
    throw new Error('error: no salt in session storage');
  }
  let signedSalt;
  try {
    console.log('@@@@@@@@@@@@@@@')
    signedSalt = await saltSignInstance.doSign({
      salt: salt,
      hint: 'Sign this salt to generate encryption key',
    });
  } catch (error) {
    // Handle the case where signing is refused by the user
    // Throw a new error or handle it in a way that your application expects
    throw new Error('error: User refused to sign the salt');
  }
  const Storage_Encryption_Key = keccak256(signedSalt).toString('hex');
  return decryptPrivateKey(encryptedPrivateKey, Storage_Encryption_Key);
};

export const encryptPrivateKey = (privateKey: string, key: string) => {
  return symmetricCryptoJSEncryptInstance.encrypt(privateKey, key);
};

export const decryptPrivateKey = (encryptedPrivateKey: string, key: string) => {
  return symmetricCryptoJSEncryptInstance.decrypt(encryptedPrivateKey, key);
};

// TODO 所有的用户相关的加密解密都放在这里
