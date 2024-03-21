// components/IframeComponent.tsx
import React, { useEffect, useRef } from 'react';
import parse from 'html-react-parser';
import DOMPurify from 'dompurify';
interface IframeProps {
  htmlContent: string;
  handleClick: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
}

const IframeComponent: React.FC<IframeProps> = ({ htmlContent, handleClick }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    handleIframeLoad()
  }, [iframeRef.current]); // 仅在组件挂载时执行
  // useEffect(() => {
  //   const iframeDocument = iframeRef.current.contentDocument;
  //   if (iframeDocument) {
  //     if (htmlContent) {
  //       iframeDocument.open();
  //     } else {
  //       iframeDocument.close();
  //     }
  //   }
  // }, [htmlContent])
  const handleIframeLoad = () => {
    console.log(DOMPurify.sanitize(htmlContent))
    if (iframeRef.current) {
      // 向 iframe 内部注入 HTML 内容
      const iframeDocument = iframeRef.current.contentDocument;
      if (iframeDocument) {
        console.log(iframeDocument)
        // iframeDocument.open();
        // iframeDocument.write(htmlContent);
        // iframeDocument.close();
        const links: NodeListOf<HTMLAnchorElement> = iframeDocument.querySelectorAll('a');
        console.log('links', links)
        // 为每个 <a> 标签添加点击事件处理函数
        links.forEach(link => {
          console.log('为每个 <a> 标签添加点击事件处理函数');
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
      srcDoc={DOMPurify.sanitize(htmlContent)}
      style={{ width: '100%', height: '100%', border: 'none' }}
    ></iframe>

  );
};

export default IframeComponent;
