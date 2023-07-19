import {
    IPersonItem,
    MetaMailTypeEn,
    MailBoxTypeEn,
    MarkTypeEn,
    ReadStatusTypeEn,
    IMailContentItem,
    FilterTypeEn,
} from '../constants';
import { MMHttp } from '../base';

const APIs = {
    getMailList: '/mails/filter', // 根据筛选条件获取邮件列表
    mailDetail: '/mails/', // 获取邮件详情
    createDraft: '/mails/draft', // 新建草稿
    updateMail: '/mails/{mail_id}', // patch方法，更新邮件内容
    sendMail: '/mails/{mail_id}/send', // 发送邮件
    uploadAttachment: '/mails/{mail_id}/attachments', //上传附件
    deleteAttachment: '/mails/{mail_id}/attachments/{attachment_id}', // 删除附件
};

interface ICreateDraftParams {
    meta_type: MetaMailTypeEn;
    key?: string;
}

interface ICreateDraftResponse {
    message_id: string;
}

interface IUpdateMailParams {
    subject: string;
    mail_from?: IPersonItem;
    mail_to: IPersonItem[];
    mail_cc?: IPersonItem[];
    mail_bcc?: IPersonItem[];
    in_reply_to?: string;
    part_text?: string;
    part_html?: string;
    meta_type?: MetaMailTypeEn;
}

interface IUpdateMailResponse {
    message_id: string;
    mail_date: string;
}

interface ISendMailParams {
    date?: string;
    signature?: string;
    keys: string[];
}

interface ISendMailResponse {
    message_id: string;
}

interface IUploadAttachmentResponse {
    message_id: string;
    attachment_id: string;
    attachment: {
        attachment_id: string;
        filename: string;
        size: number;
        content_type: string;
        sha256: string;
        download: {
            url: string;
            expire_at: string;
        };
    };
    date: string;
}

interface IDeleteAttachmentResponse {
    message_id: string;
    attachment_id: string;
    date: string;
}

type IGetMailDetailResponse = IMailContentItem;

interface IGetMailListParams {
    limit?: number;
    filter: FilterTypeEn;
    page_index: number;
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
        return this.get<void, IGetMailDetailResponse>(`${APIs.mailDetail}${id}`);
    }

    async getMailList(params: IGetMailListParams) {
        return this.post<IGetMailListParams, IGetMailListResponse>(APIs.getMailList, params);
    }

    async changeMailStatus(mails: IMailChangeParams[], options: IMailChangeOptions) {
        return this.post<IChangeMailStatusParams, void>(APIs.mailDetail, { mails, ...options });
    }

    async createDraft(type: MetaMailTypeEn, key?: string) {
        return this.post<ICreateDraftParams, ICreateDraftResponse>(APIs.createDraft, {
            meta_type: type,
            key,
        });
    }

    async updateMail(mailId: string, params: IUpdateMailParams) {
        return this.patch<IUpdateMailParams, IUpdateMailResponse>(
            APIs.updateMail.replace('{mail_id}', window.btoa(mailId)),
            params
        );
    }

    async sendMail(mailId: string, params: ISendMailParams) {
        return this.post<ISendMailParams, ISendMailResponse>(
            APIs.sendMail.replace('{mail_id}', window.btoa(mailId)),
            params
        );
    }

    async uploadAttachment(mailId: string, data: FormData) {
        return this.post<FormData, IUploadAttachmentResponse>(
            APIs.uploadAttachment.replace('{mail_id}', window.btoa(mailId)),
            data,
            {
                timeout: 60000,
            }
        );
    }

    async deleteAttachment(mailId: string, attachmentId: string) {
        return this.delete<void, IDeleteAttachmentResponse>(
            APIs.deleteAttachment.replace('{mail_id}', window.btoa(mailId)).replace('{attachment_id}', attachmentId)
        );
    }
}

export const mailHttp = new MMMailHttp();
