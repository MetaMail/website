import { NextPage } from 'next';
import type { AppProps } from 'next/app';
import { ReactNode, ReactElement, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import { themeChange } from 'theme-change';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/globals.css';
import { useThemeStore } from 'lib/zustand-store';
import * as ReactGA from 'react-ga';
import { useRouter } from 'next/router';
export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & { Component: NextPageWithLayout };

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const { isDark, setIsDark } = useThemeStore()
  useEffect(() => {
    themeChange(false);
    const theme = document.documentElement.getAttribute('data-theme') || '';
    document.body.className = theme;
  }, []);
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const theme = document.documentElement.getAttribute('data-theme') || '';
      document.body.className = theme;
      setIsDark(theme == 'dark' ? true : false)
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => {
      observer.disconnect();
    };
  }, []);
  const getLayout = Component.getLayout ?? (page => page);

  return getLayout(
    <>
      <Component {...pageProps} />
      <ToastContainer autoClose={1000} hideProgressBar={true} />
    </>
  );
}
