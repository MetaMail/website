import { createContext } from 'react';
import { IPersonItem } from 'lib/constants';

interface IMailBoxContext {
    checkEncryptable?: (receivers: IPersonItem[]) => Promise<{ encryptable: boolean; publicKeys: string[] }>;
    createDraft?: (
        mailFrom: IPersonItem,
        mailTo: IPersonItem[]
    ) => Promise<{ message_id: string; randomBits: string; key: string }>;
    setShowLoading?: (show: boolean) => void;
    logout?: () => void;
    getMailStat?: () => Promise<void>;
}
const MailBoxContext = createContext<IMailBoxContext>({});
export default MailBoxContext;
