/*
 * @Author: your name
 * @Date: 2024-06-05 14:26:39
 * @LastEditTime: 2024-06-11 16:39:06
 * @LastEditors: 韦玮莹
 * @Description: In User Settings Edit
 * @FilePath: \website\components\SignModal\normalModal.tsx
 */

import ModalLogo from 'assets/modaLogo.svg';
import { useSignatureModalStore } from 'lib/zustand-store';


function NormalSignModal() {
  const handleClose = () => {
    setIsShowSignature(false)
  }
  const { isShowSignature, setIsShowSignature, message } = useSignatureModalStore()
  return (
    <div className='fixed w-[100vw]  h-[100vh] z-40' style={{ display: isShowSignature ? 'block' : 'none' }}>
      <div className="relative w-[100vw]  h-[100vh] flex justify-center items-center font-Poppins bg-transparent">
        <div style={{ background: `url(${ModalLogo.src}) center 40px no-repeat` }} className={` shadow-gray-500 shadow-xl absolute flex flex-col justify-center items-center text-center pt-[97px]  box-border w-[440px] h-[240px] bg-white rounded-[15px]  z-[100] ${isShowSignature ? 'block' : 'hidden'}`}>
          <h5 className="text-[#000] text-[16px] leading-26 font-[700] mb-30 mt-[-10px] font-poppinsSemiBold">{message}</h5>
          <p className="rounded-8 text-[#0069E5] bg-[rgba(0,105,229,0.10)]  text-center w-[304px] h-[25px] leading-none flex items-center justify-center text-14">Waiting for signature...</p>
          <button className='text-[#8F8F8F] text-14 font-[600] leading-24 mt-10' onClick={handleClose}>Cancel</button>
        </div>
      </div >
    </div>
  )
}
export default NormalSignModal; 