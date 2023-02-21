import { create } from 'zustand'
const useStore = create((set) => ({
  filter: 0,
  page: 1,
  removeAll: () => set({ filter: 0 , page: 1}),
  addPage: () => set((state: { page: number }) => ({ page: state.page + 1 })),
  subPage: () => set((state: { page: number }) => ({ page: state.page - 1 })),
  setFilter: (filterType:number) => set(() => ({ filter: filterType})),
}))

export default useStore