import { IPersonItem } from '../constants';
import { deleteStorage, getStorage, updateStorage } from '../storage';

const MailListInfo = 'MailListInfo';

export const getMailListInfo = () => {
    return getStorage(MailListInfo, null);
};

const TempMailStoreKey = 'MetaMailTemporalContent';

interface IMailContent {
    subject?: string;
    mail_from?: IPersonItem;
    mail_to?: IPersonItem[];
    part_html?: string;
}

export const setMailContent = (mail: IMailContent) => {
    updateStorage(TempMailStoreKey, mail);
};

export const clearMailContent = () => {
    deleteStorage(TempMailStoreKey);
};

export const getMailContent = () => {
    return getStorage(TempMailStoreKey);
};

export const clearMailListInfo = () => {
    deleteStorage(MailListInfo);
};
