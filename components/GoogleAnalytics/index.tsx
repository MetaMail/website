import { useEffect } from 'react';
import { useRouter } from 'next/router';

// const GoogleAnalytics = () => {
export default function GoogleAnalytics(): any {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      // 这里可以根据路径判断是否加载 Google Analytics
      if (url === '/mailbox') {
        loadGoogleAnalytics();
      }
    };

    // 初始化时加载一次
    if (router.pathname === '/mailbox') {
      loadGoogleAnalytics();
    }

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, []);

  const loadGoogleAnalytics = () => {
    if (document && document.body) {
      console.log('ga执行1')
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
          'domains': ['https://www.mmail-test.ink/','https://www.metamail.ink/'] // 替换为你的网站域名
        }
      });
    `;
      document.body.appendChild(gtagScript);
    }
  }

  return null; // 这个组件不需要渲染任何内容
};


