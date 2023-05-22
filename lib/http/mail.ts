import {
    IPersonItem,
    MetaMailTypeEn,
    MailBoxTypeEn,
    MarkTypeEn,
    ReadStatusTypeEn,
    IMailContentItem,
    FilterTypeEn,
} from '../constants';
import { httpInstance } from '../base';

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
}

interface IUpdateMailResponse {
    message_id: string;
    mail_date: string;
}

interface ISendMailParams {
    date?: string;
    signature?: string;
    keys: string[];
    data: string;
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

interface IGetMailDetailResponse {
    mail: IMailContentItem;
}

interface IGetMailListParams {
    limit: number;
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

export async function getMailDetailByID(id: string) {
    return httpInstance.get<void, IGetMailDetailResponse>(`${APIs.mailDetail}${id}`);
}

export async function getMailList(params: IGetMailListParams) {
    return httpInstance.post<IGetMailListParams, IGetMailListResponse>(APIs.getMailList, params);
}

export async function changeMailStatus(mails: IMailChangeParams[], mark?: MarkTypeEn, read?: ReadStatusTypeEn) {
    return httpInstance.post<IChangeMailStatusParams, void>(APIs.mailDetail, {
        mails,
        mark,
        read,
    });
}

export async function createDraft(type: MetaMailTypeEn, key?: string) {
    return httpInstance.post<ICreateDraftParams, ICreateDraftResponse>(APIs.createDraft, {
        meta_type: type,
        key,
    });
}

export async function updateMail(mailId: string, params: IUpdateMailParams) {
    return httpInstance.patch<IUpdateMailParams, IUpdateMailResponse>(
        APIs.updateMail.replace('{mail_id}', window.btoa(mailId)),
        params
    );
}

export async function sendMail(mailId: string, params: ISendMailParams) {
    return httpInstance.post<ISendMailParams, ISendMailResponse>(
        APIs.sendMail.replace('{mail_id}', window.btoa(mailId)),
        params
    );
}

export async function uploadAttachment(mailId: string, data: FormData) {
    return httpInstance.post<FormData, IUploadAttachmentResponse>(
        APIs.uploadAttachment.replace('{mail_id}', window.btoa(mailId)),
        data,
        {
            timeout: 60000,
        }
    );
}

export async function deleteAttachment(mailId: string, attachmentId: string) {
    return httpInstance.delete<void, IDeleteAttachmentResponse>(
        APIs.deleteAttachment.replace('{mail_id}', window.btoa(mailId)).replace('{attachment_id}', attachmentId)
    );
}
