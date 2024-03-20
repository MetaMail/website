import { useState, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';

interface EditorMethods {
  getContent: () => string;
  setContent: (content: string) => void;
}

interface MyEditorProps {
  onEditorReady: (methods: EditorMethods) => void;
  initialValue: string;
}

const MyEditor: React.FC<MyEditorProps> = ({ onEditorReady, initialValue }) => {
  const [content, setContent] = useState<string>(initialValue);

  // 获取编辑器内容
  const getContent = () => {
    return content;
  };

  // 设置编辑器内容
  const setContentValue = (value: string) => {

    setContent(value);
  };

  useEffect(() => {
    // 调用父组件提供的方法
    onEditorReady({
      getContent,
      setContent: setContentValue
    });
  }, [content, onEditorReady]);

  const handleEditorChange = (content: string, editor: any) => {
    console.log(content)
    // 当编辑器内容发生变化时，更新 state 中的内容
    setContent(content);
  };

  return (
    <Editor
      apiKey="noo6l6wle4d75xjcxaynsazleypv5m1do39w2gsn4av2iqwv"
      initialValue={initialValue}
      value={content}
      init={{
        remove_tinymce_branding: true,
        height: 500,
        menubar: false,
        plugins: [
          'advlist autolink lists link image charmap print preview anchor',
          'searchreplace visualblocks code fullscreen',
          'insertdatetime media table paste code help wordcount'
        ],
        toolbar:
          '|undo redo | formatselect | bold italic backcolor | \
          alignleft aligncenter alignright alignjustify | \
          bullist numlist outdent indent | removeformat | help'
      }}
      onEditorChange={handleEditorChange} // 在内容变化时触发回调函数
    />
  );
};

export default MyEditor;
