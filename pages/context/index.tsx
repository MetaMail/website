import { createContext } from 'react';

interface IMailBoxContext {
    removeAllState?: () => void;
    name?: string;
}
const MailBoxContext = createContext<IMailBoxContext>({});
export default MailBoxContext;
