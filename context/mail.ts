import { createContext } from 'react';
import { IMailContentItem, IPersonItem } from 'lib/constants';

interface IMailBoxContext {
  checkEncryptable?: (receivers: IPersonItem[]) => Promise<{ encryptable: boolean; publicKeys: string[] }>;
  createDraft?: (mailTo: IPersonItem[], message_id?: string, subject?: string,selectedMail?:IMailContentItem,isForward?:boolean) => void;
  setShowLoading?: (show: boolean) => void;
  logout?: () => void;
  getMailStat?: () => Promise<void>;
  getRandomBits?: (type: 'detail' | 'draft') => Promise<string>;
}
const MailBoxContext = createContext<IMailBoxContext>({});
export default MailBoxContext;
