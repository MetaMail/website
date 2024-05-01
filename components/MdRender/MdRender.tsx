import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import 'github-markdown-css';

interface IProps {
  markdownText: string;
}

export default function MDRender({ markdownText }: IProps) {
  return (
    <div className="container max-w-[1024px] min-h-[100vh] mx-auto bg-[#F2F5F8] px-24 md:px-62 text-[#333] text-[16px] py-56">
      <div className="bg-white p-24 md:p-32 markdown-body github-markdown-css">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdownText}</ReactMarkdown>
      </div>
    </div>
  );
}
