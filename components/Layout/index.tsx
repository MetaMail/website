import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Titlebar from './Titlebar';

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <div className="font-poppins w-screen h-screen flex flex-row">
            <Sidebar />
            <div className="flex flex-col flex-1 pr-28 pb-28">
                <Titlebar />
                <main className="h-[calc(100vh-45px)] bg-white w-[calc(100%)] rounded-10">{children}</main>
            </div>
        </div>
    );
}
