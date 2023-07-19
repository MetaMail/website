import { create } from 'zustand';
import { IMailContentItem, FilterTypeEn } from 'lib/constants';

type MailListMode = 'normal' | 'selected';

interface IMailListState {
    mode: MailListMode;
    filterType: FilterTypeEn;
    pageIndex: number;
    unreadInboxCount: number;
    unreadSpamCount: number;
    setMode: (mode: MailListMode) => void;
    setFilterType: (filterType: FilterTypeEn) => void;
    addPageIndex: () => void;
    subPageIndex: () => void;
    resetPageIndex: () => void;
    setUnreadInboxCount: (unreadInboxCount: number) => void;
    setUnreadSpamCount: (unreadSpamCount: number) => void;
}
export const useMailListStore = create<IMailListState>()(set => ({
    mode: 'normal',
    filterType: FilterTypeEn.Inbox,
    pageIndex: 1,
    unreadInboxCount: 0,
    unreadSpamCount: 0,
    setFilterType: (filterType: FilterTypeEn) => set(() => ({ filterType })),
    setMode: (mode: MailListMode) => set(() => ({ mode })),
    addPageIndex: () => set(state => ({ pageIndex: state.pageIndex + 1 })),
    subPageIndex: () => set(state => ({ pageIndex: state.pageIndex - 1 })),
    resetPageIndex: () => set({ pageIndex: 1 }),
    setUnreadInboxCount: (unreadInboxCount: number) => set(() => ({ unreadInboxCount })),
    setUnreadSpamCount: (unreadSpamCount: number) => set(() => ({ unreadSpamCount })),
}));

interface IMailDetailState {
    selectedMail: IMailContentItem;
    setSelectedMail: (selectedMail: IMailContentItem) => void;
}
export const useMailDetailStore = create<IMailDetailState>()(set => ({
    selectedMail: null,
    setSelectedMail: (selectedMail: IMailContentItem) => set(() => ({ selectedMail })),
}));

interface INewMailState {
    selectedDraft: IMailContentItem;
    setSelectedDraft: (selectedDraft: IMailContentItem) => void;
}
export const useNewMailStore = create<INewMailState>()(set => ({
    selectedDraft: null,
    setSelectedDraft: (selectedDraft: IMailContentItem) => set(() => ({ selectedDraft })),
}));

interface IUtilsState {
    removeAllState: () => void;
}
export const useUtilsStore = create<IUtilsState>()(set => ({
    removeAllState: () => {
        const { setFilterType, resetPageIndex, setUnreadInboxCount, setUnreadSpamCount } = useMailListStore.getState();
        const { setSelectedMail } = useMailDetailStore.getState();
        const { setSelectedDraft } = useNewMailStore.getState();
        setFilterType(0);
        resetPageIndex();
        setUnreadInboxCount(0);
        setUnreadSpamCount(0);
        setSelectedMail(null);
        setSelectedDraft(null);
    },
}));
