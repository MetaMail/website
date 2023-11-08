import { IPersonItem, FilterTypeEn } from 'lib/constants';
import { IGetMailListResponse } from 'lib/http';

const UserInfoStoreKey = 'MM_UserInfo';
const RandomBitsKey = 'MM_RandomBits';
const Token_Key = 'MM_Token';
const MailListInfo = 'MM_MailListInfo';
const TempMailStoreKey = 'MM_TemporalContent';
const QuillTextKey = 'MM_Text';
const QuillHtmlKey = 'MM_Html';
const MailReply = 'MM_Reply';
const THEME = 'theme'
interface IUserInfo {
    publicKey?: string;
    ensName?: string;
    address?: string;
    privateKey?: string;
    salt?: string;
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
    return window.localStorage.getItem(key);
}

function setStorage(key: string, value: string) {
    window.localStorage.setItem(key, value);
}

function deleteStorage(key: string) {
    window.localStorage.removeItem(key);
}

function clearStorage() {
    window.localStorage.clear();
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

export const userLocalStorage = {
    setUserInfo: (value: IUserInfo) => {
        const baseInfo = doParse(getStorage(UserInfoStoreKey));
        setStorage(
            UserInfoStoreKey,
            doStringify({
                ...baseInfo,
                ...value,
            })
        );
  },
  getTheme:(): string => {
       return  getStorage(THEME);
    },
  setTheme: (mode?: string) => {
        setStorage(THEME, mode);
    },

    getUserInfo: (): IUserInfo => {
        return doParse(getStorage(UserInfoStoreKey));
    },

    clearUserInfo: () => {
        deleteStorage(UserInfoStoreKey);
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

    clearAll: () => {
        clearStorage();
    },
};

export const mailLocalStorage = {
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

    clearAll: () => {
        clearStorage();
    },
};
