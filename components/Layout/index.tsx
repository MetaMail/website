import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <div className="w-screen h-screen flex flex-row">
            <Sidebar />
            <main>{children}</main>
        </div>
    );
}
