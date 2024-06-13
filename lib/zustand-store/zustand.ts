import { create } from 'zustand';
import { IMailContentItem, FilterTypeEn, MailListItemType } from 'lib/constants';

interface IMailListState {
  filterType: FilterTypeEn;
  pageIndex: number;
  unreadCount: number;
  spamCount: number;
  list: MailListItemType[];
  detailList: IMailContentItem[];
  setDetailList: (list: IMailContentItem[]) => void;
  setList: (list: MailListItemType[]) => void;
  setFilterType: (filterType: FilterTypeEn) => void;
  addPageIndex: () => void;
  subPageIndex: () => void;
  resetPageIndex: () => void;
  setUnreadCount: (unreadInboxCount: number) => void;
  setSpamCount: (unreadSpamCount: number) => void;
}
export const useMailListStore = create<IMailListState>()(set => ({
  filterType: FilterTypeEn.Inbox,
  pageIndex: 1,
  unreadCount: 0,
  spamCount: 0,
  list: [],
  detailList: [],
  setDetailList: (detailList: IMailContentItem[]) => set(() => ({ detailList })),
  setList: (list: MailListItemType[]) => set(() => ({ list })),
  setFilterType: (filterType: FilterTypeEn) => set(() => ({ filterType })),
  addPageIndex: () => set(state => ({ pageIndex: state.pageIndex + 1 })),
  subPageIndex: () => set(state => ({ pageIndex: state.pageIndex - 1 })),
  resetPageIndex: () => set({ pageIndex: 1 }),
  setUnreadCount: (unreadCount: number) => set(() => ({ unreadCount })),
  setSpamCount: (spamCount: number) => set(() => ({ spamCount })),
}));

interface IMailDetailState {
  selectedMail: IMailContentItem;
  isDetailExtend: boolean;
  setSelectedMail: (selectedMail: IMailContentItem) => void;
  setIsDetailExtend: (isDetailExtend: boolean) => void;
}
export const useMailDetailStore = create<IMailDetailState>()(set => ({
  selectedMail: null,
  isDetailExtend: false,
  setSelectedMail: (selectedMail: IMailContentItem) => set(() => ({ selectedMail })),
  setIsDetailExtend: (isDetailExtend: boolean) => set(() => ({ isDetailExtend })),
}));

interface INewMailState {
  isSendSuccess: boolean;
  setIsSendSuccess: (isSendSuccess: boolean) => void
  selectedDraft: MailListItemType;
  setSelectedDraft: (selectedDraft: MailListItemType) => void;
}
export const useNewMailStore = create<INewMailState>()(set => ({
  isSendSuccess: false,
  setIsSendSuccess: (isSendSuccess: boolean) => set(() => ({ isSendSuccess })),
  selectedDraft: null,
  setSelectedDraft: (selectedDraft: MailListItemType) => set(() => ({ selectedDraft })),
}));

interface IUtilsState {
  removeAllState: () => void;
}
export const useUtilsStore = create<IUtilsState>()(set => ({
  removeAllState: () => {
    const { setFilterType, resetPageIndex, setUnreadCount, setSpamCount } = useMailListStore.getState();
    const { setSelectedMail } = useMailDetailStore.getState();
    const { setSelectedDraft } = useNewMailStore.getState();
    setFilterType(0);
    resetPageIndex();
    setUnreadCount(0);
    setSpamCount(0);
    setSelectedMail(null);
    setSelectedDraft(null);
  },
}));

interface ITheme {
  isDark: boolean,
  theme: string;
  setTheme: (theme: string) => void;
  setIsDark: (isDark: boolean) => void;
}
export const useThemeStore = create<ITheme>()(set => ({
  isDark: false,
  theme: "",
  setTheme: (theme: string) => set(() => ({ theme })),
  setIsDark: (isDark: boolean) => set(() => ({ isDark })),
}));

// 输入框是否展示
interface IIsInputShow {
  isInputShow: boolean;
  setIsInputShow: (isInputShow: boolean) => void;
}
export const useIsInputShow = create<IIsInputShow>()(set => ({
  isInputShow: false,
  setIsInputShow: (isInputShow: boolean) => set(() => ({ isInputShow })),
}));

// 签名提示弹窗
interface IIsShowSignature {
  isShowSignature: boolean;
  setIsShowSignature: (isShowSignature: boolean) => void;
  message: string;
  setMessage: (message: string) => void;
  handleShowSignature: (message: string) => void;
}
export const useSignatureModalStore = create<IIsShowSignature>()(set => ({
  isShowSignature: false,
  setIsShowSignature: (isShowSignature: boolean) => set(() => ({ isShowSignature })),
  message: '',
  setMessage: (message: string) => set(() => ({ message })),
  handleShowSignature: (message: string) => {
    set(() => ({ message }));
    set(() => ({ isShowSignature: true }));
  }
}));

// 三部签名弹窗
interface IIsShowThreeSignature {
  isShowThreeSignature: boolean;
  setIsShowThreeSignature: (isShowThreeSignature: boolean) => void;
  activeStep: number;
  setActiveStep: (activeStep: number) => void;
  message: string;
  setMessage: (message: string) => void;
}
export const useThreeSignatureModalStore = create<IIsShowThreeSignature>()(set => ({
  isShowThreeSignature: false,
  setIsShowThreeSignature: (isShowThreeSignature: boolean) => set(() => ({ isShowThreeSignature })),
  activeStep: 0,
  setActiveStep: (activeStep: number) => set(() => ({ activeStep })),
  message: '',
  setMessage: (message: string) => set(() => ({ message })),
}))