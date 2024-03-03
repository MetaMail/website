import React, { ReactNode } from 'react';
import { useMailDetailStore } from 'lib/zustand-store';

import Sidebar from './Sidebar';
import Titlebar from './Titlebar';

export default function Layout({ children }: { children: ReactNode }) {
  const { selectedMail } = useMailDetailStore();
  return (
    <div className="bg-base-200 font-poppins w-screen h-screen flex flex-row">
      <Sidebar />
      <div className="flex-1 pr-20 pb-20">
        <Titlebar />
        <main
          className={`h-[calc(100%-64px)] bg-base-100 w-[calc(100%)] rounded-10 relative  flex ${!selectedMail ? 'flex-col' : 'flex-row'
            }`}>
          {children}
        </main>
      </div>
    </div>
  );
}
