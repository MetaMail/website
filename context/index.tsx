import { createContext } from 'react';

interface IMailBoxContext {
    removeAllState?: () => void;
}
const MailBoxContext = createContext<IMailBoxContext>({});
export default MailBoxContext;
