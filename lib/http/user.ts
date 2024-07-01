import { MMHttp } from '../base';
import { AccountStatusTypeEn } from '../constants';
import { userLocalStorage } from 'lib/utils';

const APIs = {
  getEncryptionKey: '/users/key', //获取和消息加密密钥
  postEncryptionKey: '/users/key', //上传签名和消息加密密钥
  getRandomString: '/auth/random', // 获取随机字符串，用户需要对这个字符串签名
  getAuthToken: '/auth/token', // 上传签名后的字符串，获取jwt token
  getUserProfile: '/users/profile', // 获取用户信息
};

// 从服务器获取的加密信息和上传到服务器的加密信息格式 共用

interface IGetEncryptionKeyParams {
  address: string;
}
interface IGetEncryptionKeyResponse {
  salt: string;
  encrypted_private_key: string;
  public_key: string;
  signature: string;
  addr?: string;
  date?: string;
}

interface IPutEncryptionKeyParams {
  data: IGetEncryptionKeyResponse;
}

interface IGetRandomStrToSignParams {
  addr: string;
}

export interface IGetRandomStrToSignResponse {
  signMethod: string;
  tokenForRandom: string;
  domain: any;
  signTypes: any;
  signMessages: any;
  isNewUser: boolean;//是否新用户
}

interface IGetJwtTokenParams {
  tokenForRandom: string;
  signedMessage: string;
}

interface IGetJwtTokenResponse {
  newUser: boolean;
  user: {
    last_login: string;
    addr: string;
    chain: string;
    created_at: string;
    account_status: AccountStatusTypeEn;
    ens: string;
  };
  expireDate: string;
  token: string;
}

interface IGetUserProfileResponse {
  total_email_size: number;
  total_email_size_limit: number;
}

class MMUserHttp extends MMHttp {
  async getEncryptionKey(address: string) {
    return this.get<IGetEncryptionKeyParams, IGetEncryptionKeyResponse>(`${APIs.getEncryptionKey}`, {
      address,
    });
  }

  async putEncryptionKey(params: IPutEncryptionKeyParams) {
    return this.put<IPutEncryptionKeyParams, void>(APIs.postEncryptionKey, params);
  }

  async getRandomStrToSign(addr: string) {
    return this.post<IGetRandomStrToSignParams, IGetRandomStrToSignResponse>(APIs.getRandomString, { addr });
  }

  async getJwtToken(params: IGetJwtTokenParams) {
    const data = await this.post<IGetJwtTokenParams, IGetJwtTokenResponse>(APIs.getAuthToken, params);
    userLocalStorage.setToken(data.token || '');
    return data;
  }

  async getLogout() {
    return this.delete<void, void>(APIs.getAuthToken);
  }

  async getUserProfile() {
    return this.get<void, IGetUserProfileResponse>(APIs.getUserProfile);
  }
}

export const userHttp = new MMUserHttp();
