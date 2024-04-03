
import Markdown from 'react-markdown';
import { routeBack } from 'assets/icons';
import Icon from 'components/Icon';
import { useRouter } from 'next/router';
import styles from './MarkdownRenderer.module.css'; // 引入自定义样式文件
interface IProps {
  markdownText: string;
}
export default function MDRender({ markdownText }: IProps) {
  const router = useRouter();
  return (
    <>
      <div className="container max-w-[1024px] min-h-[100vh] mx-auto bg-[#F2F5F8] px-24 md:px-62 text-[#333] text-[16px] py-56">
        <h2 className="mb-24 text-[#0069E5] text-[34px] font-[PoppinsBold]">Metamail</h2>
        <div className="bg-white p-24 md:p-32">
          <Markdown skipHtml={false} components={{
            // 为链接添加 className，应用自定义样式
            a: ({ node, children, ...props }) => (
              <a className={styles.markdownLink} {...props}>
                {children}
              </a>
            ),
          }}>
            {markdownText}
          </Markdown>
        </div>
        <button title='go back' onClick={() => { router.back() }} className='mt-16 text-white text-14 bg-[#0069E5] flex justify-center items-center w-60 h-40 rounded-20'><Icon className='w-20 h-20' url={routeBack}></Icon></button>
      </div>
    </>

  )
}