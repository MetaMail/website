// components/IframeComponent.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import parse from 'html-react-parser';
import DOMPurify from 'dompurify';
interface IframeProps {
  htmlContent: string;
  handleClick: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
}

const IframeComponent: React.FC<IframeProps> = ({ htmlContent, handleClick }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const handleIframeLoad = useCallback(() => {
    setIframeLoaded(true);
  }, []);

  useEffect(() => {
    // 向 iframe 内部注入 HTML 内容
    const iframeDocument = iframeRef.current.contentDocument;
    if (iframeRef.current) {
      console.log('加载完成')
      iframeDocument.body.innerHTML = DOMPurify.sanitize(htmlContent);
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
    } else {
      console.log('还没加载完成')
      const handleDisabledClick = (event: { preventDefault: () => void; }) => {
        event.preventDefault();
      };
      const links: NodeListOf<HTMLAnchorElement> = iframeDocument.querySelectorAll('a');
      links.forEach(link => {
        link.addEventListener('click', handleDisabledClick as unknown as EventListener);
      });

      // 移除事件监听器以避免内存泄漏
      return () => {
        links.forEach(link => {
          link.removeEventListener('click', handleDisabledClick as unknown as EventListener);
        });
      };
    }

  }, [iframeLoaded, iframeRef]);

  return (
    <iframe
      ref={iframeRef}
      title="My iframe"
      onLoad={handleIframeLoad}
      // srcDoc={DOMPurify.sanitize(htmlContent)}
      style={{ width: '100%', height: '100%', border: 'none' }}
    ></iframe>

  );
};

export default IframeComponent;

