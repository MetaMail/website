import { httpInstance } from '../base';

const APIs = {
    getEncryptionKey: '/users/key/', //获取和消息加密密钥
    postEncryptionKey: '/users/key', //上传签名和消息加密密钥
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

export async function getEncryptionKey(address: string) {
    return httpInstance.get<void, IGetEncryptionKeyResponse>(`${APIs.getEncryptionKey}${address}`);
}

export async function putEncryptionKey(params: IPutEncryptionKeyParams) {
    return httpInstance.put<IPutEncryptionKeyParams, void>(APIs.postEncryptionKey, params);
}
