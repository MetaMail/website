import { cancel, extend } from '@assets/icons';
import Icon from '@components/Icon';
import Layout from '@components/Layouts';
import sendMail from '@assets/sendMail.svg';
import addAttach from '@assets/addAttach.svg';
import { EditorFormats, EditorModules } from './constants';
import React, { ReactElement, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import useStore from '@utils/storage/zustand';
import BaseLine from '@components/BaseLine';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { IPersonItem, MetaMailTypeEn } from '@constants/interfaces';
import { getUserInfo } from '@utils/storage/user';
import dynamic from 'next/dynamic';
export default function NewMail() {
    //<textarea className="flex-1 textarea" placeholder="Content"></textarea>
    const [isExtend, setIsExtend] = useState(false);
    const isOnCompose = useStore((state: any) => state.isOnCompose)
    const setIsOnCompose = useStore((state:any) => state.setIsOnCompose)



    const [subject, setSubject] = useState<string>('');
  
    const [receivers, setReceivers] = useState<IPersonItem[]>([]);
  
    const [content, setContent] = useState<string>('');
    const [attList, setAttList] = useState<any[]>([]);
    const [loaded, setLoaded] = useState<boolean>(false);
    const [editable, setEditable] = useState<boolean>();
  
    //const draftID = query?.id;
    //const type: MetaMailTypeEn = Number(query?.type);
    const myKeyRef = useRef<string>();
    //const currRandomBitsRef = useRef<string>(randomBits);
    const dateRef = useRef<string>();
    const allowSaveRef = useRef(true);
    const ReactQuill = useMemo(() => dynamic(() => import('react-quill'), { ssr: false }),[]);
    const reactQuillRef = useRef<ReactQuill>();
    const getQuill = () => {
      if (typeof reactQuillRef?.current?.getEditor !== 'function') return;
  
      return reactQuillRef.current.makeUnprivilegedEditor(
        reactQuillRef.current.getEditor(),
      );
    };
    const handleChangeContent = (content: any) => {
        setContent(content);
        const quill = getQuill();
    
        if (!quill || !quill?.getHTML || !quill?.getText) {
          //notification.error({
          //  message: 'ERROR',
          //  description: 'Failed to get message content',
          //});
    
          return;
        }
    
        //let html = quill?.getHTML(),
        //  text = quill?.getText();
        //console.log('set');
      };
    
    


    return(
    <div className={isOnCompose?'visible':'invisible'}>
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
                    onClick={()=>{setIsOnCompose(false)}}
                    /> 
            </div>
        </header>
        <div className='text-sm text-[#878787]'>
        <input type="text" placeholder="From:" className="flex pl-0 mt-14 h-21 input w-full max-w-xs text-sm text-[#878787] focus:outline-none" />
            <BaseLine/>
            <input type="text" placeholder="To: " className="flex pl-0 mt-14 h-21 input w-full max-w-xs text-sm text-[#878787] focus:outline-none" />
            <BaseLine/>
            <input type="text" placeholder="Subject" className="flex pl-0 mt-14 h-21 input w-full max-w-xs text-sm text-[#878787] focus:outline-none" />
            <BaseLine/>
        </div>
        
        <ReactQuill
              ref={(el) => {
                el ? (reactQuillRef.current = el) : void 0;
              }}
              className='flex-1 flex flex-col-reverse'
              theme="snow"
              placeholder={''}
              modules={EditorModules}
              formats={EditorFormats}
              value={content}
              onChange={(value) => {
                handleChangeContent(value);
              }}
            />
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