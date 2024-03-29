import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { useThemeStore } from 'lib/zustand-store';
// import tinymce from 'tinymce';

interface EditorMethods {
  getContent: () => string;
  setContent: (content: string) => void;
}

interface MyEditorProps {
  initialValue?: string;
}

const MyEditor: React.ForwardRefRenderFunction<EditorMethods, MyEditorProps> = ({ initialValue }, ref) => {
  const [content, setContent] = useState<string>('');
  const { isDark } = useThemeStore();

  const [initData, setInitData] = useState<any>({
    icons: 'thin',
    icons_url: '/tinymce/icons/thin/icons.js',
    toolbar_items_size: 'small',
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
    toolbar: 'bold italic alignleft aligncenter alignright alignjustify bullist numlist link',
    toolbar_location: 'bottom',// 将工具栏放置在底部
  })
  const editorRef = useRef(null);
  const [switching, setSwitching] = useState(false);
  const [skin, setSkin] = useState({})
  const handleInit = (evt: any, editor: any) => {
    // 将编辑器实例保存到 ref 中
    editorRef.current = editor;
  };


  // 在组件挂载后，将编辑器实例暴露给父组件
  useImperativeHandle(ref, () => ({
    getContent: () => content,
    setContent: (newContent: string) => setContent(newContent)
  }));
  const handleEditorChange = (newContent: string, editor: any) => {
    setContent(newContent);
  };

  const handleGetContent = () => {
    // 确保编辑器已经实例化
    if (editorRef.current && typeof window !== 'undefined') {
      // 使用 tinymce.get 获取编辑器实例并获取内容

      const instance = tinymce?.get(editorRef.current.id);
      instance?.destroy();
      setSkin({
        skin_url: "/tinymce/skins/ui/oxide" + (isDark ? "-dark" : ""),
        content_css: isDark
          ? "/tinymce/skins/content/dark/content.min.css"
          : "/tinymce/skins/content/default/content.min.css",
      });
      setSwitching(true); // 开始切换皮肤
    } else {
      console.log('Editor not yet initialized');
    }
  };




  useEffect(() => {
    handleGetContent()
    return () => {
      setSwitching(false)
      setTimeout(() => { setSwitching(false) }, 100)
    }
  }, [isDark])
  return (
    <div className='h-full min-h-[200px]' >
      {!switching &&
        <Editor
          onInit={handleInit}
          tinymceScriptSrc={'/tinymce/tinymce.min.js'}
          onEditorChange={handleEditorChange}
          apiKey="noo6l6wle4d75xjcxaynsazleypv5m1do39w2gsn4av2iqwv"
          value={content}
          init={{ ...initData, ...skin }}
        />
      }
    </div >
  );
};

export default forwardRef(MyEditor);
