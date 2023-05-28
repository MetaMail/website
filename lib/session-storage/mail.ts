import { MMSessionStorage } from 'lib/base';
import { IPersonItem, FilterTypeEn } from 'lib/constants';
import { IGetMailListResponse } from 'lib/http';

const MailListInfo = 'MM_MailListInfo';
const TempMailStoreKey = 'MM_TemporalContent';
const QuillTextKey = 'MM_Text';
const QuillHtmlKey = 'MM_Html';
const MailReply = 'MM_Reply';

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

class MMMailSessionStorage extends MMSessionStorage {
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

    getQuillHtml(): string {
        return this.getStorage(QuillHtmlKey);
    }

    getQuillText(): string {
        return this.getStorage(QuillTextKey);
    }

    setQuillHtml(html: string) {
        this.updateStorage(QuillHtmlKey, html);
    }

    setQuillText(text: string) {
        this.updateStorage(QuillTextKey, text);
    }

    getMailReply(): string {
        return this.getStorage(MailReply);
    }

    clearMailReply() {
        this.deleteStorage(MailReply);
    }
}

export const mailSessionStorage = new MMMailSessionStorage();
