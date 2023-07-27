import { IPersonItem, FilterTypeEn } from 'lib/constants';
import { IGetMailListResponse } from 'lib/http';

const UserInfoStoreKey = 'MM_UserInfo';
const ShowNameKey = 'MM_ShowName';
const RandomBitsKey = 'MM_RandomBits';
const Token_Key = 'MM_Token';
const MailListInfo = 'MM_MailListInfo';
const TempMailStoreKey = 'MM_TemporalContent';
const QuillTextKey = 'MM_Text';
const QuillHtmlKey = 'MM_Html';
const MailReply = 'MM_Reply';

interface IUserInfo {
    publicKey?: string;
    ensName?: string;
    address?: string;
    privateKey?: string;
    purePrivateKey?: string;
    salt?: string;
}

interface IAllUserInfo extends IUserInfo {
    showName?: string;
}

interface IMailContent {
    subject?: string;
    mail_from?: IPersonItem;
    mail_to?: IPersonItem[];
    part_html?: string;
}

interface IMailListInfo {
    data: IGetMailListResponse;
    filter: FilterTypeEn;
}

function getStorage(key: string) {
    return window.sessionStorage.getItem(key);
}

function setStorage(key: string, value: string) {
    window.sessionStorage.setItem(key, value);
}

function deleteStorage(key: string) {
    window.sessionStorage.removeItem(key);
}

function clearStorage() {
    window.sessionStorage.clear();
}

function doParse(data: any) {
    if (data === null || data === undefined || data === '') {
        return {};
    }
    return JSON.parse(data);
}

function doStringify(data: any) {
    if (data === null || data === undefined || data === '') {
        return '';
    }
    return JSON.stringify(data);
}

export const userSessionStorage = {
    setUserInfo: (value: IUserInfo) => {
        const baseInfo = doParse(getStorage(UserInfoStoreKey));
        setStorage(
            UserInfoStoreKey,
            doStringify({
                ...baseInfo,
                ...value,
            })
        );

        const { ensName, address } = value;
        setStorage(ShowNameKey, ensName ?? address);
    },

    getUserInfo: (): IAllUserInfo => {
        const basic = getStorage(UserInfoStoreKey);
        return Object.assign(doParse(basic), { showName: userSessionStorage.getShowName() });
    },

    clearUserInfo: () => {
        deleteStorage(UserInfoStoreKey);
    },

    getShowName: (): string => {
        return getStorage(ShowNameKey);
    },

    setShowName: (name: string) => {
        setStorage(ShowNameKey, name);
    },

    getRandomBits: (): string => {
        return getStorage(RandomBitsKey);
    },

    setRandomBits: (name?: string) => {
        setStorage(RandomBitsKey, name);
    },

    setToken: (token: string) => {
        setStorage(Token_Key, token);
    },

    getToken: (): string => {
        return getStorage(Token_Key);
    },

    clearToken: () => {
        deleteStorage(Token_Key);
    },
};

export const mailSessionStorage = {
    getMailListInfo: (): IMailListInfo => {
        return doParse(getStorage(MailListInfo));
    },

    setMailListInfo: (mailListInfo: IMailListInfo) => {
        return setStorage(MailListInfo, doStringify(mailListInfo));
    },

    clearMailListInfo: () => {
        deleteStorage(MailListInfo);
    },

    getMailContent: (): IMailContent => {
        return doParse(getStorage(TempMailStoreKey));
    },

    setMailContent: (mail: IMailContent) => {
        setStorage(TempMailStoreKey, doStringify(mail));
    },

    clearMailContent: () => {
        deleteStorage(TempMailStoreKey);
    },

    getQuillHtml: (): string => {
        return getStorage(QuillHtmlKey);
    },

    setQuillHtml: (html: string) => {
        setStorage(QuillHtmlKey, html);
    },

    getQuillText: (): string => {
        return getStorage(QuillTextKey);
    },

    setQuillText: (text: string) => {
        setStorage(QuillTextKey, text);
    },

    getMailReply: (): string => {
        return getStorage(MailReply);
    },

    setMailReply: (reply: string) => {
        return setStorage(MailReply, reply);
    },

    clearMailReply: () => {
        deleteStorage(MailReply);
    },
};
