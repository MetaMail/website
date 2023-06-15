import { NextPage } from 'next';
import type { AppProps } from 'next/app';
import { ReactNode, ReactElement } from 'react';
import { ChakraProvider, useToast } from '@chakra-ui/react';
import { GlobalContext } from 'context';

import '../styles/globals.css';
import '../styles/quill.css';

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
    getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & { Component: NextPageWithLayout };

export default function App({ Component, pageProps }: AppPropsWithLayout) {
    const toast = useToast({
        position: 'top',
        isClosable: true,
    });
    const getLayout = Component.getLayout ?? (page => page);

    return getLayout(
        <GlobalContext.Provider value={{ toast }}>
            <ChakraProvider>
                <Component {...pageProps} />
            </ChakraProvider>
        </GlobalContext.Provider>
    );
}
