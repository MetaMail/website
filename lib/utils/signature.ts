import { ethers } from 'ethers';
import { ExternalProvider } from '@ethersproject/providers';

enum SignTypeEn {
    Personal = 0,
    Eth = 1,
    TypedData = 2,
    TypedDataV3 = 3,
    TypedDataV4 = 4,
}

const getEthereum = () => window.ethereum as ExternalProvider;

export const getPersonalSign = async (account: string, msg: string, password?: string) => {
    try {
        const ethereum = getEthereum();
        const sign = await ethereum.request({
            method: 'personal_sign',
            params: [`0x${Buffer.from(msg, 'utf8').toString('hex')}`, account, password ?? ''],
        });

        return Promise.resolve(sign);
    } catch (err) {
        return Promise.resolve(false);
    }
};

export const getEthSign = async (account: string, msg: string) => {
    try {
        if (!msg.startsWith('0x')) {
            throw new Error('Invalid message, please hash it.');
        }
        const ethereum = getEthereum();
        const sign = await ethereum.request({
            method: 'eth_sign',
            params: [account, msg],
        });

        return sign;
    } catch (err) {
        console.error(err);
    }
};

type TypedMessage = {
    type: string; // string\uint32
    name: string;
    value: string | number;
};

const getTypedDataSign = async (account: string, msgParams: TypedMessage[]) => {
    try {
        const ethereum = getEthereum();
        const sign = await ethereum.request({
            method: 'eth_signTypedData',
            params: [msgParams, account],
        });

        return sign;
    } catch (err) {
        console.error(err);
    }
};

export const getSignResult = async (type: SignTypeEn, account: string, msg: any) => {
    let signResult;

    switch (type) {
        case SignTypeEn.Personal:
            signResult = await getPersonalSign(account, msg);
            break;
        case SignTypeEn.Eth:
            signResult = getEthSign(account, msg);
            break;
        case SignTypeEn.TypedData:
            signResult = getTypedDataSign(account, msg);
            break;
        case SignTypeEn.TypedDataV3:
        case SignTypeEn.TypedDataV4:
        default:
            break;
    }

    if (!signResult || typeof signResult !== 'string' || signResult.length === 0) {
        throw new Error('Something went wrong when signing');
    }

    return signResult;
};

export const ethSignMessage = async (msg: string, address: string) => {
    const ethereum = getEthereum();
    if (!ethereum) throw new Error('Your client does not support Ethereum');

    const msgData = JSON.stringify({
        types: {
            EIP712Domain: [
                {
                    name: 'name',
                    type: 'string',
                },
                {
                    name: 'version',
                    type: 'string',
                },
            ],
            Message: [
                // 新增一个类型，代表消息数据
                { name: 'title', type: 'string' },
                { name: 'content', type: 'string' },
            ],
        },
        domain: {
            name: 'MetaMail',
            version: '1',
        },
        primaryType: 'Message', // 将主类型设置为新定义的类型
        message: {
            title: 'Sign this message to login',
            content: msg,
        },
    });

    try {
        const str = await ethereum.request({
            method: 'eth_signTypedData_v4',
            params: [address, msgData],
        });

        const typedData = JSON.parse(msgData);
        const domain = typedData.domain;
        const types = typedData.types;
        const value = typedData.message;
        const signature = str;

        const verified = ethers.utils.verifyTypedData(domain, types, value, signature);
        console.log(verified);
        console.log(address);
        console.log('Signature:', str);
        return str;
    } catch (error) {
        console.error('Error:', error);
        return error;
    }
};
