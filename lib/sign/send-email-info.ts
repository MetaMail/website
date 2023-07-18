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
            Sign_Mail: [
                { name: 'from', type: 'string' },
                { name: 'to', type: 'string[]' },
                { name: 'date', type: 'string' },
                { name: 'subject', type: 'string' },
                { name: 'text_hash', type: 'string' },
                { name: 'html_hash', type: 'string' },
                { name: 'attachments_hash', type: 'string[]' },
                { name: 'name', type: 'string' },
                { name: 'keys', type: 'string[]' },
            ],
        };
    }
}

export const sendEmailInfoSignInstance = new MMSendEmailInfoSign();
