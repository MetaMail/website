import { MMSessionStorage } from 'lib/base';
import { IPersonItem, FilterTypeEn } from 'lib/constants';
import { IGetMailListResponse } from 'lib/http';

const MailListInfo = 'MailListInfo';
const TempMailStoreKey = 'MetaMailTemporalContent';

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

class MMMailStorage extends MMSessionStorage {
    constructor() {
        super('mail');
    }

    getMailListInfo(): IMailListInfo {
        return this.getStorage(MailListInfo, null);
    }

    updateMailListInfo(mailListInfo: IMailListInfo) {
        return this.updateStorage(MailListInfo, mailListInfo);
    }

    setMailContent(mail: IMailContent) {
        this.updateStorage(TempMailStoreKey, mail);
    }

    clearMailContent() {
        this.deleteStorage(TempMailStoreKey);
    }

    getMailContent(): IMailContent {
        return this.getStorage(TempMailStoreKey);
    }

    clearMailListInfo() {
        this.deleteStorage(MailListInfo);
    }
}

export const mailStorage = new MMMailStorage();
