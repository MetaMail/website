import axios, { AxiosProgressEvent } from 'axios';
import {
    IPersonItem,
    MetaMailTypeEn,
    MailBoxTypeEn,
    MarkTypeEn,
    ReadStatusTypeEn,
    IMailContentItem,
    FilterTypeEn,
    IMailContentAttachment,
} from '../constants';
import { MMHttp } from '../base';
import { MMCancelableUpload } from './cancelable-upload';

const APIs = {
    getMailList: '/mails/filter', // 根据筛选条件获取邮件列表
    mailDetail: '/mails', // 获取邮件详情
    createDraft: '/mails/draft', // 新建草稿
    updateMail: '/mails', // patch方法，更新邮件内容
    sendMail: '/mails/send', // 发送邮件
    uploadAttachment: '/mails/attachments', //上传附件
    deleteAttachment: '/mails/attachments', // 删除附件
    mailsStat: '/mails/stat', // 获取邮件统计信息
    getSuggestedReceivers: '/mails/suggested_receivers', // 获取推荐收件人
};

interface ICreateDraftParams {
    meta_type: MetaMailTypeEn;
    key?: string;
    mail_from?: IPersonItem;
    mail_to?: IPersonItem[];
}

interface ICreateDraftResponse {
    message_id: string;
}

interface IUpdateMailParams {
    mail_id: string;
    subject?: string;
    mail_from?: IPersonItem;
    mail_to?: IPersonItem[];
    mail_cc?: IPersonItem[];
    mail_bcc?: IPersonItem[];
    in_reply_to?: string;
    part_text?: string;
    part_html?: string;
    meta_type?: MetaMailTypeEn;
    attachments?: IMailContentAttachment[];
}

interface IUpdateMailResponse {
    message_id: string;
    mail_date: string;
}

interface ISendMailParams {
    mail_id: string;
    date?: string;
    signature?: string;
    keys: string[];
    mail_decryption_key?: string;
}

interface ISendMailResponse {
    message_id: string;
}

export interface IUploadAttachmentResponse {
    message_id: string;
    attachment_id: string;
    attachment: {
        attachment_id: string;
        filename: string;
        size: number;
        content_type: string;
        encrypted_sha256?: string;
        plain_sha256?: string;
        download: {
            url: string;
            expire_at: string;
        };
    };
    date: string;
}

interface IDeleteAttachmentParams {
    mail_id: string;
    attachment_id: string;
}
interface IDeleteAttachmentResponse {
    message_id: string;
    attachment_id: string;
    date: string;
}

interface IMailsStatResponse {
    unread: number;
    spam: number;
    draft: number;
}

type IGetMailDetailResponse = IMailContentItem;

type IGetMailDetailParams = {
    mail_id: string;
};

interface IGetMailListParams {
    limit?: number;
    filter: FilterTypeEn;
    page_index: number;
}

interface IGetSuggestedReceiversParams {
    prefix: string;
}

interface IGetSuggestedReceiversResponse {
    suggestions: string[];
}

export interface IGetMailListResponse {
    total: number;
    unread: number;
    page_num: number;
    page_index: number;
    mails: IMailContentItem[];
}

interface IChangeMailStatusParams {
    mails: IMailChangeParams[];
    mark?: MarkTypeEn;
    read?: ReadStatusTypeEn;
}

export interface IMailChangeParams {
    message_id: string;
    mailbox?: MailBoxTypeEn;
}

export interface IMailChangeOptions {
    mark?: MarkTypeEn;
    read?: ReadStatusTypeEn;
}

class MMMailHttp extends MMHttp {
    async getMailDetailByID(id: string) {
        return this.get<IGetMailDetailParams, IGetMailDetailResponse>(`${APIs.mailDetail}`, {
            mail_id: id,
        });
    }

    async getMailList(params: IGetMailListParams) {
        return this.post<IGetMailListParams, IGetMailListResponse>(APIs.getMailList, params);
    }

    async changeMailStatus(mails: IMailChangeParams[], options: IMailChangeOptions) {
        return this.post<IChangeMailStatusParams, void>(APIs.mailDetail, { mails, ...options });
    }

    async createDraft(type: MetaMailTypeEn, key: string, mailFrom: IPersonItem, mailTo: IPersonItem[]) {
        return this.post<ICreateDraftParams, ICreateDraftResponse>(APIs.createDraft, {
            meta_type: type,
            key,
            mail_from: mailFrom,
            mail_to: mailTo,
        });
    }

    async updateMail(params: IUpdateMailParams) {
        return this.patch<IUpdateMailParams, IUpdateMailResponse>(APIs.updateMail, params);
    }

    async sendMail(params: ISendMailParams) {
        return this.post<ISendMailParams, ISendMailResponse>(APIs.sendMail, params);
    }

    uploadAttachment(data: FormData, onUploadProgress?: (progressEvent: AxiosProgressEvent) => void) {
        const cancelableUpload = new MMCancelableUpload();
        cancelableUpload.onUploadProgressChangeHandler = onUploadProgress;
        cancelableUpload.upload<IUploadAttachmentResponse>(APIs.uploadAttachment, data);
        return cancelableUpload;
    }

    async deleteAttachment(params: IDeleteAttachmentParams) {
        return this.delete<IDeleteAttachmentParams, IDeleteAttachmentResponse>(APIs.deleteAttachment, params);
    }

    async getMailStat() {
        return this.get<void, IMailsStatResponse>(APIs.mailsStat);
    }

    async getSuggestedReceivers(params: IGetSuggestedReceiversParams) {
        return this.get<IGetSuggestedReceiversParams, IGetSuggestedReceiversResponse>(
            APIs.getSuggestedReceivers,
            params
        );
    }
}

export const mailHttp = new MMMailHttp();
