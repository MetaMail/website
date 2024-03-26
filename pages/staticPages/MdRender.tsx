
import Markdown from 'react-markdown';
import { routeBack } from 'assets/icons';
import Icon from 'components/Icon';
import { useRouter } from 'next/router';
interface IProps {
  markdownText: string;
}
export default function MDRender({ markdownText }: IProps) {
  const router = useRouter();
  return (
    <>
      <div className="container max-w-[1024px] min-h-[100vh] mx-auto bg-[#F2F5F8] px-62 text-[#333] text-[16px] pt-56">
        <h2 className="mb-24 text-[#0069E5] text-[34px] font-[PoppinsBold]">Metamail</h2>
        <div className="bg-white p-32">
          <Markdown skipHtml={false}  >
            {markdownText}
          </Markdown>
        </div>
        <button title='go back' onClick={() => { router.back() }} className='mt-16 text-white text-14 bg-[#0069E5] flex justify-center items-center w-60 h-40 rounded-20'><Icon className='w-20 h-20' url={routeBack}></Icon></button>
      </div>
    </>

  )
}