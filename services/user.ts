import request from '../utils/request';

const APIs = {
  getUserInfos: '/users/find', // 获取随机字符串，用户需要对这个字符串签名
  getMyProfile: '/users/profile', // 上传签名后的字符串，获取jwt token
  postPublicKey: '/users/public_key', // 上传公钥
  getEncryptionKey: '/users/key/', //获取和消息加密密钥
  postEncryptionKey: '/users/key', //上传签名和消息加密密钥
};
export function getEncryptionKey(address: string) {
  return request(`${APIs.getEncryptionKey}${address}`).get();
}

export function getUserInfos(data: string[]) {
  return request(APIs.getUserInfos).post({
    data,
  });
}

export function getMyProfile() {
  return request(APIs.getMyProfile).get();
}

interface IPublicKeyData {
  addr: string;
  date: string; //当前的时间
  version: string; //metamask默认支持的KEY格式
  public_key: string; //获取到的key
  sign_data?: string; // 可以不要
  signature: string; // 用户对sign_data签名的结果
}

interface IEncryptionKeyData{
  salt: string,
  addr: string,
  signature: string,
  message_encryption_public_key: string,
  message_encryption_private_key: string,
  signing_private_key: string,
  signing_public_key: string,
  data: string,
}

export function postPublicKey(data: IPublicKeyData) {
  return request(APIs.postPublicKey).post(data);
}

export function putEncryptionKey(data: any) {
  return request(APIs.postEncryptionKey).post(data);
}
