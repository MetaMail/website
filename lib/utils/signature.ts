import { ethers } from 'ethers';
import { ExternalProvider } from '@ethersproject/providers';
import { useAccount } from 'wagmi';
import { IPersonItem } from 'lib/constants/interfaces';

enum SignTypeEn {
    Personal = 0,
    Eth = 1,
    TypedData = 2,
    TypedDataV3 = 3,
    TypedDataV4 = 4,
}

interface ISendMailInfo {
    from: string;
    to: IPersonItem[];
    date: string;
    subject: string;
}
export enum MessageNotificationTypeEn {
    RandomStr = 0,
    Salt = 1,
    SendMailInfo = 2,
    KeyData = 3,
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

export const ethSignMessage = async (msg: string, type: MessageNotificationTypeEn, info?: ISendMailInfo) => {
    const ethereum = getEthereum();
    const address = useAccount().address ?? '';
    if (!ethereum) throw new Error('Your client does not support Ethereum');

    try {
        const metamaskProvider = new ethers.providers.Web3Provider(ethereum);
        const signer = metamaskProvider.getSigner();

        const domain = {
            name: 'MetaMail',
            version: '1',
        };
        let types, message;
        if (type !== MessageNotificationTypeEn.SendMailInfo) {
            types = {
                Message: [
                    { name: 'title', type: 'string' },
                    { name: 'content', type: 'string' },
                ],
            };
            let title;

            switch (type) {
                case MessageNotificationTypeEn.RandomStr:
                    title = 'Sign this randomString to Login';
                    break;
                case MessageNotificationTypeEn.Salt:
                    title = 'Sign this salt to generate encryption key';
                    break;
                case MessageNotificationTypeEn.KeyData:
                    title = 'Sign this message to confirm your encryption key';
                    break;
                default:
                    break;
            }
            message = {
                title: title,
                content: msg,
            };
        } else {
            //TODO: sendmail
            //types = ;
            //message = ;
            types = {
                Message: [
                    { name: 'mail_from', type: 'string' },
                    { name: 'mail_to', type: 'string' },
                    { name: 'date', type: 'string' },
                    { name: 'subject', type: 'string' },
                ],
            };
            message = {
                mail_from: info?.from ?? '',
                mail_to:
                    info.to
                        .map(item => {
                            item.address;
                        })
                        .toString() ?? '',
                date: info?.date ?? '',
                subject: info?.subject ?? '',
            };
        }
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
