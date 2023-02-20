import { cancel, extend } from '@assets/icons';
import Icon from '@components/Icon';
import Layout from '@components/Layouts';
import sendMail from '@assets/sendMail.svg';
import addAttach from '@assets/addAttach.svg';
import React, { ReactElement, useEffect, useState } from 'react';
import Image from 'next/image';
function BaseLine(){
    return(
        <div className='w-full h-0 border border-[#DDDDDD] border-opacity-50'/>
    )
}
export default function NewMail(props: { onCompose: any; setOnCompose: (arg0: boolean) => void; }) {
    const [isExtend, setIsExtend] = useState(false);

    return(
    <div className={props.onCompose?'flex':'hidden'}>
    <div className={isExtend?'flex flex-col font-poppins bg-white p-18 h-full transition-all w-[calc(100vw-200px)] absolute bottom-0 right-0 border border-[#EFEFEF] rounded-10':'flex flex-col font-poppins bg-white p-18 h-502 w-[45vw] absolute bottom-0 right-0 border border-[#EFEFEF] rounded-10 transition-all'}>
        <header className='flex justify-between'>        
            <div className='flex flex-row'>
                <div className='w-6 h-24 bg-[#006AD4] rounded-4'/>
                <span className='pl-7 font-black text-xl'>New Message</span>
            </div>
            <div className='flex gap-10 self-start'>
                <Icon
                    url={extend}
                    checkedUrl={extend}
                    className='w-13 h-auto self-center '
                    onClick={()=>setIsExtend(!isExtend)}/> 
                <Icon
                    url={cancel}
                    className='w-13 scale-[120%] h-auto self-center'
                    onClick={()=>props.setOnCompose(false)}
                    /> 
            </div>
        </header>
        <div className='text-sm text-[#878787]'>
            <h1 className='flex mt-20 h-21 '>
                From
                <div className='pl-30'>dddd</div>
            </h1>
            <BaseLine/>
            <h1 className='flex mt-14 h-21'>
                To
                <div className='pl-30'>dddd</div>
            </h1>
            <BaseLine/>
            <h1 className='flex mt-14 h-21'>
                Subject
                <div className='pl-30'>dddd</div>
            </h1>
            <BaseLine/>
        </div>
        <div className='flex-1 px-37'>
            
        </div>
        <div className='pt-17 flex gap-13'>
            <button>
                <Image alt={'sendMail'} src={sendMail}/>
            </button>
            <button>
                <Image alt={'addAttach'} src={addAttach}/>
            </button>
        </div>
    </div>
    </div>
    )
}

NewMail.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;