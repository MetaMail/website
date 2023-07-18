import { useState } from 'react';
import { useMailDetailStore, useNewMailStore } from 'lib/zustand-store';

import Layout from 'components/Layout';
import MailList, { ListMode } from 'components/MailList';
import MailDetail from 'components/MailDetail';
import NewMail from 'components/NewMail';
import { MailListItemType } from 'components/MailList/components/MailListItem';

export default function MailBoxPage() {
    const { isMailDetail } = useMailDetailStore();
    const { isWriting } = useNewMailStore();

    const [listMode, setListMode] = useState<ListMode>('selected');
    const [selectedMail, setSelectedMail] = useState<MailListItemType>();

    return (
        <Layout>
            <MailList
                mode={listMode}
                onSelectMail={mail => {
                    setSelectedMail(mail);
                    setListMode(mail ? 'selected' : 'normal');
                }}
            />
            {selectedMail && <MailDetail mail={selectedMail} />}
            {isWriting && <NewMail />}
        </Layout>
    );
}
