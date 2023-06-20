import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <div className="font-poppins w-screen h-screen flex flex-row">
            <Sidebar />
            <div className="flex flex-col flex-1">
                <Header />
                <main className="h-[calc(100vh-45px-28px)] bg-white w-[calc(100%-28px)] rounded-10">{children}</main>
            </div>
        </div>
    );
}
