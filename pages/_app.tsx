import { NextPage } from 'next';
import type { AppProps } from 'next/app';
import { ReactNode, ReactElement, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import { themeChange } from 'theme-change';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/globals.css';
import { useThemeStore } from 'lib/zustand-store';
export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & { Component: NextPageWithLayout };

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const { isDark, setIsDark } = useThemeStore()
  useEffect(() => {
    const measurementId = 'G-QMHT4QP6TP'; // 替换为你的 GA4 衡量 ID

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.body.appendChild(script);

    const gtagScript = document.createElement('script');
    gtagScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${measurementId}', {
        'send_page_view': true,
        'transport_type': 'beacon',
        'linker': {
          'domains': ['https://www.mmail-test.ink/'] // 替换为你的网站域名
        }
      });
    `;
    document.body.appendChild(gtagScript);
  }, []);
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
