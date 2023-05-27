import { IPersonItem } from 'lib/constants';
import { PostfixOfAddress } from 'lib/base';

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