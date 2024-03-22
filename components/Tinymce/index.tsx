import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Editor } from '@tinymce/tinymce-react';
interface EditorMethods {
  getContent: () => string;
  setContent: (content: string) => void;
}

interface MyEditorProps {
  initialValue?: string;
}

const MyEditor: React.ForwardRefRenderFunction<EditorMethods, MyEditorProps> = ({ initialValue }, ref) => {
  const [content, setContent] = useState<string>('');
  // 在组件挂载后，将编辑器实例暴露给父组件
  useImperativeHandle(ref, () => ({
    getContent: () => content,
    setContent: (newContent: string) => setContent(newContent)
  }));
  const handleEditorChange = (newContent: string, editor: any) => {
    setContent(newContent);
    // console.log('Content was updated:', newContent);
  };
  return (
    <div className='h-full min-h-[200px]' >
      <Editor
        onEditorChange={handleEditorChange}
        apiKey="noo6l6wle4d75xjcxaynsazleypv5m1do39w2gsn4av2iqwv"
        value={content}
        init={{
          remove_tinymce_branding: true,
          height: '100%',
          branding: false, // 隐藏tinymce右下角水印
          statusbar: false, // 隐藏底部状态栏
          resize: false, //右下角调整编辑器大小，false关闭，true开启只改变高度，'both' 宽高都能改变
          menubar: false,
          poweredByAsset: false,
          plugins: [
            'autolink',
            'link',
            'image ',
            'lists',
            'charmap',
            'preview',
            'anchor',
            'pagebreak',
            'visualblocks',
            'visualchars',
            'code',
            'fullscreen',
            'insertdatetime',
            'media',
            'nonbreaking',
            'table',
            'directionality',
            'emoticons',
            'template',
            'preview'
          ],
          toolbar:
            '|undo redo | formatselect | bold italic backcolor | \
          alignleft aligncenter alignright alignjustify | \
          bullist numlist outdent indent | removeformat link',
          toolbar_location: 'bottom' // 将工具栏放置在底部
        }}
      />
    </div >
  );
};

export default forwardRef(MyEditor);
