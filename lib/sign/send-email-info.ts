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
                { name: 'from_address', type: 'string' },
                { name: 'from_name', type: 'string' },
                { name: 'to_address', type: 'string[]' },
                { name: 'to_name', type: 'string[]' },
                { name: 'cc_address', type: 'string[]' },
                { name: 'cc_name', type: 'string[]' },
                { name: 'date', type: 'string' },
                { name: 'subject', type: 'string' },
                { name: 'text_hash', type: 'string' },
                { name: 'html_hash', type: 'string' },
                { name: 'attachments_hash', type: 'string[]' },
                { name: 'keys', type: 'string[]' },
            ],
        };
    }
}

export const sendEmailInfoSignInstance = new MMSendEmailInfoSign();
