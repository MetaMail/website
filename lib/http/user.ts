import { MMHttp } from '../base';
import { AccountStatusTypeEn } from '../constants';

const APIs = {
    getEncryptionKey: '/users/key/', //获取和消息加密密钥
    postEncryptionKey: '/users/key', //上传签名和消息加密密钥
    getRandomString: '/auth/random', // 获取随机字符串，用户需要对这个字符串签名
    getAuthToken: '/auth/token', // 上传签名后的字符串，获取jwt token
};

interface IGetEncryptionKeyResponse {
    salt: string;
    signing_private_key: string;
    message_encryption_private_key: string;
    signing_public_key: string;
    message_encryption_public_key: string;
    signature: string;
    data: string;
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
interface IPutEncryptionKeyParams {
    data: IEncryptionKeyData;
}

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
        last_login: string;
        addr: string;
        chain: string;
        created_at: string;
        account_status: AccountStatusTypeEn;
        ens: string;
        public_key: string;
    };
    expireDate: string;
}

class MMUserHttp extends MMHttp {
    async getEncryptionKey(address: string) {
        return this.get<void, IGetEncryptionKeyResponse>(`${APIs.getEncryptionKey}${address}`);
    }

    async putEncryptionKey(params: IPutEncryptionKeyParams) {
        return this.put<IPutEncryptionKeyParams, void>(APIs.postEncryptionKey, params);
    }

    async getRandomStrToSign(addr: string) {
        return this.post<IGetRandomStrToSignParams, IGetRandomStrToSignResponse>(APIs.getRandomString, { addr });
    }

    async getJwtToken(params: IGetJwtTokenParams) {
        return this.post<IGetJwtTokenParams, IGetJwtTokenResponse>(APIs.getAuthToken, params);
    }

    async getLogout() {
        return this.delete<void, void>(APIs.getAuthToken);
    }
}

export const userHttp = new MMUserHttp();
