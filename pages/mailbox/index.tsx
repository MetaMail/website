import { useMailDetailStore, useNewMailStore } from 'lib/zustand-store';

import Layout from 'components/Layout';
import MailList from 'components/MailList';
import MailDetail from 'components/MailDetail';
import NewMail from 'components/NewMail';

export default function MailBoxPage() {
    const { isMailDetail } = useMailDetailStore();
    const { isWriting } = useNewMailStore();

    return (
        <Layout>
            <MailList />
            {isMailDetail && <MailDetail />}
            {isWriting && <NewMail />}
        </Layout>
    );
}
