import React, { forwardRef, useEffect, useImperativeHandle } from 'react';
import dynamic from 'next/dynamic';

const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

const QuillWrapper = (props: any, ref: any) => {
  const reactQuillRef = React.useRef<any>();

  useImperativeHandle(ref, () => ({
    getQuill: () => {
        console.log('this')
        console.log(typeof reactQuillRef?.current?.getEditor)
        if (typeof reactQuillRef?.current?.getEditor !== 'function') return;
        console.log('this')
        return reactQuillRef.current.makeUnprivilegedEditor(
          reactQuillRef.current.getEditor(),
        );
    },
  }));

  return (
    <ReactQuill
    ref={(el) => {
        if (el) {
            reactQuillRef.current = el;
          }}}
    {...props}
    />
  );
};

export default forwardRef(QuillWrapper);