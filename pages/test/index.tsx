// import React, { useEffect, useState } from 'react'

// function Demo() {
//   const [count, setCount] = useState(0)
//   /**
//    * @@@ 无依赖项
//    * 第一次加载---执行return外的部分
//    * 每次更新会先执行rerurn内部分，再执行return外部分
//    */
//   useEffect(() => {
//     console.log('无依赖---------------------------', count)
//     return () => {
//       console.log('执行  无依赖  时的return的函数')
//     }
//   })
//   /**
//  * @@@ 依赖项为[]
//  * 第一次加载---执行第一个参数的函数，类似于执行componentDidMount，且只执行一遍，
//  * return 函数会在页面销毁或者移除组件的时候执行，类似componentWillUnMount
//  */
//   useEffect(() => {
//     console.log('依赖为[]------------------------', count)
//     return () => {
//       console.log('执行 依赖为[]  时的return的函数')
//     }
//   }, [])
//   /**
//    * @@@ 依赖项不为空的时候
//    * 页面一进来会执行第一个函数return外的部分，每次依赖更新会先执行return内的部分再执行return外的部分
//    */
//   useEffect(() => {
//     console.log('依赖为[count]------------------------', count)
//     return () => {
//       console.log('执行 依赖为[count]  时的return的函数')
//     }
//   }, [count])
//   return (
//     <div>
//       <p>count的值为： {count} </p>
//       <button onClick={() => setCount(count + 1)}>add</button>
//     </div>
//   )
// }

// export default Demo
import React, { useEffect, useRef, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';


// 在需要动态加载的地方使用dynamic函数

const App = () => {
  const [initConfig, setInitConfig] = useState({}); // 初始皮肤为 'oxide'

  const [isDark, setIsDark] = useState(false);
  const editorRef = useRef(null);
  const [switching, setSwitching] = useState(false);

  const handleInit = (evt: any, editor: any) => {
    // 将编辑器实例保存到 ref 中
    editorRef.current = editor;
  };

  const handleGetContent = () => {
    // 确保编辑器已经实例化
    if (editorRef.current) {
      // 使用 tinymce.get 获取编辑器实例并获取内容
      const instance = tinymce.get(editorRef.current.id);
      instance?.destroy();
      setInitConfig({
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
    <div>
      {/* 添加更多按钮来切换其他皮肤 */}
      <button onClick={() => setIsDark(!isDark)}>黑色？isDark</button>
      {!switching && <Editor
        onInit={handleInit}
        apiKey="noo6l6wle4d75xjcxaynsazleypv5m1do39w2gsn4av2iqwv"
        initialValue="<p>This is the initial content of the editor</p>"
        init={initConfig} // 通过函数获取最新的配置
        onRemove={(e) => {
          console.log('onRemove------------------------', e)
        }}
      />}
    </div>

  );
};

export default App;

