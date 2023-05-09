import request from '../utils/request';

const APIs = {
  getEncryptionKey: '/users/key/', //获取和消息加密密钥
  postEncryptionKey: '/users/key', //上传签名和消息加密密钥
};
export function getEncryptionKey(address: string) {
  return request(`${APIs.getEncryptionKey}${address}`).get();
}

interface IEncryptionKeyData {
  salt: string;
  addr: string;
  signature: string;
  message_encryption_public_key: string;
  message_encryption_private_key: string;
  signing_private_key: string;
  signing_public_key: string;
  data: string;
  date: string;
}
interface IPutEncryptionKeyData {
  data: IEncryptionKeyData;
}

export function putEncryptionKey(data: IPutEncryptionKeyData) {
  return request(APIs.postEncryptionKey).put(data);
}
