import { NextPage } from 'next';
import type { AppProps } from 'next/app';
import { ReactNode, ReactElement, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import { themeChange } from 'theme-change';

import 'react-toastify/dist/ReactToastify.css';
import '../styles/globals.css';

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
    getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & { Component: NextPageWithLayout };

export default function App({ Component, pageProps }: AppPropsWithLayout) {
    useEffect(() => {
        themeChange(false);
    }, []);

    const getLayout = Component.getLayout ?? (page => page);

    return getLayout(
        <>
            <Component {...pageProps} />
            <ToastContainer autoClose={1000} hideProgressBar={true} />
        </>
    );
}
