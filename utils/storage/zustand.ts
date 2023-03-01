import { IMailItem } from '@constants/interfaces'
import { create } from 'zustand'
const useStore = create((set) => ({
  filter: 0,
  page: 1,
  unreadCount: 0,
  detailFromList: [],
  removeAll: () => set({ filter: 0 , page: 1 , unReadCount:0, detailFromList:[]}),
  addPage: () => set((state: { page: number }) => ({ page: state.page + 1 })),
  subPage: () => set((state: { page: number }) => ({ page: state.page - 1 })),
  setFilter: (filterType:number) => set(() => ({ filter: filterType})),
  setUnreadCount: (count:number) => set(() => ({ unreadCount: count})),
  resetPage: () => set({ page: 1}), 
  setDetailFromList: (item:IMailItem) => set(() => ({ detailFromList: item})),
}))

export default useStore