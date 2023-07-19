import { useState } from 'react';
import { useMailDetailStore, useNewMailStore } from 'lib/zustand-store';

import Layout from 'components/Layout';
import MailList from 'components/MailList';
import MailDetail from 'components/MailDetail';
import NewMail from 'components/NewMail';

export default function MailBoxPage() {
    const { selectedMail } = useMailDetailStore();
    const { selectedDraft } = useNewMailStore();

    return (
        <Layout>
            <MailList />
            {selectedMail && <MailDetail />}
            {selectedDraft && <NewMail />}
        </Layout>
    );
}
