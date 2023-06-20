import { useMailListStore, useMailDetailStore, useNewMailStore } from 'lib/zustand-store';
import { MailBoxContext } from 'context';

import Layout from 'components/Layout';
import MailList from 'components/MailList';
import MailDetail from 'components/MailDetail';
import NewMail from 'components/NewMail';

export default function MailBoxPage() {
    const { isMailDetail } = useMailDetailStore();
    const { isWriting } = useNewMailStore();
    const { setFilterType, resetPageIndex, setUnreadCount } = useMailListStore();
    const { setDetailFromList, setDetailFromNew } = useMailDetailStore();

    const removeAllState = () => {
        setFilterType(0);
        resetPageIndex();
        setUnreadCount(0);
        setDetailFromList(null);
        setDetailFromNew(null);
    };

    return (
        <MailBoxContext.Provider value={{ removeAllState }}>
            <Layout>
                <MailList />
                {isMailDetail && <MailDetail />}
                {isWriting && <NewMail />}
            </Layout>
        </MailBoxContext.Provider>
    );
}
