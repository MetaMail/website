import React, { ReactNode } from 'react';
import Sidebar from '@components/Layouts/Sidebar';

export default function Layout({ children }: { children: ReactNode }, props: {setOnCompose: (arg0: boolean) => void;}) {
  return (
    <div className="w-screen h-screen flex flex-row">
      <Sidebar setOnCompose={props.setOnCompose} unreadCount={{
        unread: undefined
      }}/>
      <main>{children}</main>
    </div>
  );
}
