import { MarkTypeEn, ReadStatusTypeEn, IPersonItem } from 'lib/constants';
import { IMailChangeParams, mailHttp } from 'lib/http';
import { PostfixOfAddress } from 'lib/base';

//import router from "next/router";

export const handleDelete = async (inputMails: IMailChangeParams[]) => {
    const mails = inputMails;
    try {
        await mailHttp.changeMailStatus(mails, MarkTypeEn.Trash, undefined);
    } catch (e) {
        console.log(e);
        //notification.error({
        //  message: 'Failed',
        //  description: 'Sorry, network problem.',
        //});
    } finally {
    }
};

export const handleStar = async (inputMails: IMailChangeParams[], setUnStar?: boolean) => {
    console.log(setUnStar);
    console.log(inputMails);
    const mails = inputMails;
    try {
        await mailHttp.changeMailStatus(mails, setUnStar === true ? MarkTypeEn.Normal : MarkTypeEn.Starred, undefined);
    } catch {
        //notification.error({
        //  message: 'Failed',
        //  description: 'Sorry, network problem.',
        //});
    } finally {
    }
};

export const handleSpam = async (inputMails: IMailChangeParams[]) => {
    const mails = inputMails;
    try {
        console.log(mails);
        await mailHttp.changeMailStatus(mails, MarkTypeEn.Spam, undefined);
    } catch {
        //notification.error({
        //  message: 'Failed',
        //  description: 'Sorry, network problem.',
        //});
    } finally {
        //router.back();
    }
};
export const handleChangeReadStatus = async (inputMails: IMailChangeParams[], status: ReadStatusTypeEn) => {
    const mails = inputMails;
    try {
        await mailHttp.changeMailStatus(mails, undefined, status);
    } catch {
        //notification.error({
        //  message: 'Failed',
        //  description: 'Sorry, network problem.',
        //});
    }
};

const concatAddress = (item: IPersonItem) => (item?.name ?? '') + ' ' + '<' + item.address + '>';

export const metaPack = async (data: {
    from: string;
    to: IPersonItem[];
    cc?: IPersonItem[];
    date?: string;
    subject?: string;
    text_hash: string;
    html_hash: string;
    attachments_hash?: string[];
    name?: string;
    keys?: string[];
}) => {
    const { from, to, cc, date, subject, text_hash, html_hash, attachments_hash, name, keys } = data;

    let parts = [
        'From: ' +
            concatAddress({
                address: from + PostfixOfAddress,
                name: name ?? '',
            }),
        'To: ' + to.map(concatAddress).join(', '),
    ];
    if (cc && cc?.length >= 1) {
        parts.push('Cc: ' + cc?.map(concatAddress).join(', '));
    }
    parts = parts.concat([
        'Date: ' + date,
        'Subject: ' + subject,
        'Content-Hash: ' + text_hash + ' ' + html_hash,
        'Attachments-Hash: ' + attachments_hash?.join(' '),
    ]);

    if (Array.isArray(keys) && keys.length > 0) {
        parts.push('Keys: ' + keys.join(' '));
    }

    return Promise.resolve({
        packedResult: parts.join('\n'),
    });
};

export enum AttachmentRelatedTypeEn {
    Embedded = '1',
    Outside = '0',
}
