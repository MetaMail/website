import { IMailItem } from '@constants/interfaces';
import { create } from 'zustand';
const useStore = create(set => ({
  filter: 0,
  page: 1,
  unreadCount: 0,
  detailFromList: [],
  detailFromNew: [],
  isAlert: false,
  AlertInfo: '',
  isOnCompose: false,
  isMailDetail: false,
  removeAll: () =>
    set({ filter: 0, page: 1, unReadCount: 0, detailFromList: [], detailFromNew: [], isAlert: false, AlertInfo: '' }),
  addPage: () => set((state: { page: number }) => ({ page: state.page + 1 })),
  subPage: () => set((state: { page: number }) => ({ page: state.page - 1 })),
  setFilter: (filterType: number) => set(() => ({ filter: filterType })),
  setUnreadCount: (count: number) => set(() => ({ unreadCount: count })),
  resetPage: () => set({ page: 1 }),
  setDetailFromList: (item: IMailItem) => set(() => ({ detailFromList: item })),
  setDetailFromNew: (item: IMailItem) => set(() => ({ detailFromNew: item })),
  setAlertStart: (handler: string) => set(() => ({ isAlert: true, AlertInfo: handler })),
  setAlertClose: () => set(() => ({ isAlert: false, AlertInfo: '' })),
  setIsOnCompose: (compose: boolean) => set(() => ({ isOnCompose: compose })),
  setIsMailDetail: (visible: boolean) => set(() => ({ isMailDetail: visible })),
}));

export default useStore;
