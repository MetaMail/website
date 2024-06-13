/*
 * @Author: your name
 * @Date: 2024-06-12 09:35:05
 * @LastEditTime: 2024-06-12 11:38:21
 * @LastEditors: 韦玮莹
 * @Description: In User Settings Edit
 * @FilePath: \website\components\Modal\StepModal.tsx
 */
import { useThreeSignatureModalStore } from 'lib/zustand-store';
import doneStep from 'assets/doneStep.svg';
import Image from 'next/image';
export default function StepModal() {
  const { isShowThreeSignature, setIsShowThreeSignature, activeStep, setActiveStep, setMessage, message } = useThreeSignatureModalStore();
  const msgMap: { [key: number]: string } = {
    0: 'Three steps left',
    1: 'Two steps left',
    2: 'Last step'
  }
  const handleClose = () => {
    setIsShowThreeSignature(false)
  }
  return (
    <div className='fixed font-Poppins  w-[100vw]  h-[100vh] z-40' style={{ display: isShowThreeSignature ? 'block' : 'none' }
    }>
      <div className="relative w-[100vw]  h-[100vh] flex justify-center items-center font-Poppins bg-transparent">
        <div className={`shadow-gray-500 shadow-xl absolute flex flex-col justify-center items-center text-center pt-[33px]  box-border w-[520px]  bg-white rounded-[15px]  z-[100]`}>
          <div className='text-center font-Poppins '>
            <h1 className='text-black text-[text-[16px] font-700 '>Sign three steps to join <strong className='text-[#0069E5]'>MetaMail</strong></h1>
            <p className='text-11 scale-50 text-[#8F8F8F]'>only needed in first login</p>
          </div>
          {/* {activeStep} */}
          <div className='gap-[66px] text-[18px] font-600 flex relative mt-30 mb-30'>
            <div className="line bg-[#0069E5] absolute left-0 h-1 w-full top-[50%] z-[-1]"></div>
            {
              [1, 2, 3].map((item, index) => {
                // 三种样式:done\active\normal
                if (index === activeStep) {
                  return (
                    <div className='avtiveStep w-50 h-50 rounded-full flex justify-center items-center bg-[#0069E5] text-white' key={item}>{item}</div>
                  )
                } else if (index < activeStep) {
                  return (
                    <div className='done  bg-white border border-[#0069E5] w-50 h-50 rounded-full flex justify-center items-center' key={item}>
                      <Image src={doneStep} alt='done' />
                    </div>
                  )
                } else {
                  return (
                    <div className='normal border border-[#0069E5]  w-50 h-50 rounded-full flex justify-center items-center bg-white text-[#0069E5]' key={item}>{item}</div>
                  )
                }
              })
            }
          </div>
          <h5 className="text-[#000] text-[16px] leading-26 font-[700] mb-15 font-poppinsSemiBold">{msgMap[activeStep]}</h5>
          <p className="rounded-8 text-[#0069E5] bg-[rgba(0,105,229,0.10)]  text-center w-[304px] h-[25px] leading-none flex items-center justify-center text-14">Waiting for signature...</p>
          <button className='text-[#8F8F8F] text-14 font-[600] leading-24 mt-15 mb-20' onClick={handleClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
