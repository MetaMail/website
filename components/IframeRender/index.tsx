// components/IframeComponent.tsx
import React, { useEffect, useRef } from 'react';

interface IframeProps {
  htmlContent: string;
  handleClick: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
}

const IframeComponent: React.FC<IframeProps> = ({ htmlContent, handleClick }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    let time = 0;
    setInterval(() => {
      if (!iframeRef.current) {
        time++;
      } else {
        console.log(time)
      }
    }, 100)
    handleIframeLoad()
  }, [iframeRef.current]); // 仅在组件挂载时执行

  const handleIframeLoad = () => {
    // console.log(iframeRef.current)
    if (iframeRef.current) {
      // 向 iframe 内部注入 HTML 内容
      const iframeDocument = iframeRef.current.contentDocument;
      if (iframeDocument) {
        // iframeDocument.open();
        // iframeDocument.write(htmlContent);
        // iframeDocument.close();
        const links: NodeListOf<HTMLAnchorElement> = iframeDocument.querySelectorAll('a');
        // 为每个 <a> 标签添加点击事件处理函数
        links.forEach(link => {
          // console.log('为每个 <a> 标签添加点击事件处理函数');
          link.addEventListener('click', handleClick as unknown as EventListener);
        });

        // 移除事件监听器以避免内存泄漏
        return () => {
          links.forEach(link => {
            link.removeEventListener('click', handleClick as unknown as EventListener);
          });
        };
      }
    }
  };

  return (

    <iframe
      ref={iframeRef}
      title="My iframe"
      onLoad={handleIframeLoad}
      srcDoc={htmlContent}
      style={{ width: '100%', height: '100%', border: 'none' }}
    />

  );
};

export default IframeComponent;
