import { NextPage } from 'next';
import type { AppProps } from 'next/app';
import { ReactNode, ReactElement } from 'react';
import { ToastContainer } from 'react-toastify';
import { GlobalContext } from 'context';

import 'react-toastify/dist/ReactToastify.css';
import '../styles/globals.css';
import '../styles/quill.css';

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
    getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & { Component: NextPageWithLayout };

export default function App({ Component, pageProps }: AppPropsWithLayout) {
    const getLayout = Component.getLayout ?? (page => page);

    return getLayout(
        <GlobalContext.Provider value={{}}>
            <Component {...pageProps} />
            <ToastContainer />
        </GlobalContext.Provider>
    );
}
