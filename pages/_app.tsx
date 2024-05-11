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
  const router = useRouter();
  useEffect(() => {
    ReactGA.initialize('G-QMHT4QP6TP'); // 替换为您的跟踪 ID

    // 每次路由切换时发送页面视图事件
    const handleRouteChange = (url: string) => {
      ReactGA.pageview(url);
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    // 在组件销毁时取消订阅事件
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
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
