import { AccountStatusTypeEn } from 'constants/interfaces';
import { httpInstance } from 'lib/request';

const APIs = {
  getRandomString: '/auth/random', // 获取随机字符串，用户需要对这个字符串签名
  getAuthToken: '/auth/token', // 上传签名后的字符串，获取jwt token
};

interface IGetRandomStrToSignParams {
  addr: string;
}

interface IGetRandomStrToSignResponse {
  randomStr: string;
  signMethod: string;
  tokenForRandom: string;
}

interface IGetJwtTokenParams {
  tokenForRandom: string;
  signedMessage: string;
}

interface IGetJwtTokenResponse {
  newUser: boolean;
  user: {
    last_login: Date;
    addr: string;
    chain: string;
    created_at: Date;
    account_status: AccountStatusTypeEn;
    ens: string;
    public_key: string;
  };
  expireDate: Date;
}

export async function getRandomStrToSign(addr: string) {
  return httpInstance.post<IGetRandomStrToSignParams, IGetRandomStrToSignResponse>(APIs.getRandomString, { addr });
}

export async function getJwtToken(params: IGetJwtTokenParams) {
  return httpInstance.post<IGetJwtTokenParams, IGetJwtTokenResponse>(APIs.getAuthToken, params);
}

export async function getLogout() {
  return httpInstance.delete<void, void>(APIs.getAuthToken);
}
