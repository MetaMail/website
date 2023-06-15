import { createContext } from 'react';

interface IMailBoxContext {
    removeAllState?: () => void;
}
export const MailBoxContext = createContext<IMailBoxContext>({});
