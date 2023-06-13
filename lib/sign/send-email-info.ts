import { MMSign } from 'lib/base/sign';
import { IPersonItem } from 'lib/constants/interfaces';

export interface ISendMailInfo {
    from: string;
    to: IPersonItem[];
    date: string;
    subject: string;
}

class MMSendEmailInfoSign extends MMSign {
    getSignTypes() {
        return {
            Message: [
                { name: 'mail_from', type: 'string' },
                { name: 'mail_to', type: 'string' },
                { name: 'date', type: 'string' },
                { name: 'subject', type: 'string' },
            ],
        };
    }

    getSignMessage(pureInfo: ISendMailInfo) {
        return {
            mail_from: pureInfo?.from ?? '',
            mail_to:
                pureInfo.to
                    .map(item => {
                        item.address;
                    })
                    .toString() ?? '',
            date: pureInfo?.date ?? '',
            subject: pureInfo?.subject ?? '',
        };
    }
}

export const sendEmailInfoSignInstance = new MMSendEmailInfoSign();
