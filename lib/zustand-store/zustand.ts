import { create } from 'zustand';
import { IMailContentItem, FilterTypeEn } from 'lib/constants';

interface IMailListState {
    filterType: FilterTypeEn;
    pageIndex: number;
    unreadInboxCount: number;
    unreadSpamCount: number;
    setFilterType: (filterType: FilterTypeEn) => void;
    addPageIndex: () => void;
    subPageIndex: () => void;
    resetPageIndex: () => void;
    setUnreadInboxCount: (unreadInboxCount: number) => void;
    setUnreadSpamCount: (unreadSpamCount: number) => void;
}
export const useMailListStore = create<IMailListState>()(set => ({
    filterType: FilterTypeEn.Inbox,
    pageIndex: 1,
    unreadInboxCount: 0,
    unreadSpamCount: 0,
    setFilterType: (filterType: FilterTypeEn) => set(() => ({ filterType })),
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

interface ISelectedDraftItem extends IMailContentItem {
    randomBits?: string;
}

interface INewMailState {
    selectedDraft: ISelectedDraftItem;
    setSelectedDraft: (selectedDraft: ISelectedDraftItem) => void;
}
export const useNewMailStore = create<INewMailState>()(set => ({
    selectedDraft: null,
    setSelectedDraft: (selectedDraft: ISelectedDraftItem) => set(() => ({ selectedDraft })),
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
