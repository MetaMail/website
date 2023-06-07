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

    try {
        const metamaskProvider = new ethers.providers.Web3Provider(ethereum);
        const signer = metamaskProvider.getSigner();

        const domain = {
            name: 'MetaMail',
            version: '1',
        };
        const types = {
            Message: [
                { name: 'title', type: 'string' },
                { name: 'content', type: 'string' },
            ],
        };
        const message = {
            title: 'Sign this message to login',
            content: msg,
        };
        const signature = await signer._signTypedData(domain, types, message);
        const expectedSignerAddress = address;
        const recoveredAddress = ethers.utils.verifyTypedData(domain, types, message, signature);
        const verified = recoveredAddress.toLowerCase() === expectedSignerAddress.toLowerCase();

        return verified ? signature : ''; // or throw error
    } catch (error) {
        console.error('Error:', error);
        return error;
    }
};
