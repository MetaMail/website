import React, { useEffect } from 'react'
//import { notification, message, PageHeader, Button } from 'antd'
import { useRouter } from 'next/router'
import SideMenu from 'SideMenu';
import { configureChains, createClient, useAccount, WagmiConfig } from 'wagmi';
import MailList from '@pages/list';
import { clearUserInfo } from 'store/user';
//import { changeMailStatus, getMailList, IMailChangeParams } from '@/services';

export default function Mail(props:any) {
  const { children } = props;
  const { address, isConnected } = useAccount();
  const router = useRouter()   
  console.log('mail');
  console.log(address);
  console.log(isConnected);
  useEffect(() => {
  if (!isConnected) {
    clearUserInfo();
    router.push('/'); ///////////////////返回首页
  }
},[address]);
  return (
      <div className='pr-44 font-poppins mail-bg'>
      <div className='flex flex-row gap-17 '>
      <SideMenu/>
<div className='flex flex-col flex-1 w-0 h-screen pt-33'>
      <div className='flex flex-row pt-10 justify-between'>
        <div className='flex flex-row'><div className='w-6 h-24 bg-[#006AD4] rounded-4'/>
        {/*<span className='pl-7 font-black text-xl'>Inbox</span>*/}</div>
        <div className='w-490 flex flex-row justify-between'>
          {/*<button className='w-294 h-28 bg-[#F3F7FF] border border-[#1e1e1e] rounded-40'>Search</button>*/}
          <div className="form-control">
  <div className="input-group ">
    <input type="text" placeholder="Search Mail" className="input input-bordered h-32" />
    <button className="btn h-32 min-h-0 px-5 bg-[#006AD4]">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
    </button>
  </div>
  </div>
        </div>
        </div>
        {children ?? <MailList/>}
        </div>
</div>
      </div>)
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      {/*<PageHeader
        onBack={() => {
          router.back();
        }}
        title="Back"
      />
        <div className={styles.left}>
          <Icon
            url={downloadmail}
            style={{
              marginRight: '16px',
            }}
            onClick={handleClickDownload}
            tip={'Download Mail'}
          />
          <Icon
            url={reply}
            style={{
              marginRight: '8px',
            }}
            onClick={handleClickReply}
            tip={'Reply'}
          />
        </div>
      </PageHeader>

      <div className={styles.mail}>
        <div className={styles.subject}>
          <span className={styles.label}>Subject: </span>
          <span className={styles.info}>{mail?.subject ?? '-'}</span>
        </div>
        <div className={styles.from}>
          <span className={styles.label}> From: </span>
          <SenderCard {...mail?.mail_from} />
        </div>
        <div className={styles.to}>
          <span className={styles.label}> To: </span>
          <span className={styles.info}>
            {mail?.mail_to
              ? mail?.mail_to
                  .map((item) =>
                    item.name
                      ? item.name + ' <' + item.address + '>'
                      : item.address,
                  )
                  .join('; ')
              : ''}
          </span>
        </div>
        <div className={styles.date}>
          <span className={styles.label}>Date: </span>
          <span className={styles.info}>
            {mail?.mail_date ? moment(mail?.mail_date).format('llll') : ''}
          </span>
        </div>

        {readable === true ? (
          <>
            {mail?.attachments && mail.attachments.length > 0 && (
              <div className={styles.attachments}>
                <div className={styles.label}> Attachments: </div>
                <div className={styles.container}>
                  {mail?.attachments?.map((item, idx) => (
                    <AttachmentItem
                      idx={idx}
                      key={idx}
                      url={item?.download?.url}
                      name={item?.filename}
                      randomBits={randomBitsRef.current}
                    />
                  ))}
                </div>
              </div>
            )}
            <div className={styles.content} id="content-sanitized">
              <Prompt
                when={true}
                message={(loc, act) => {
                  console.log('test');

                  return true;
                }}
              />
              {mail?.part_html
                ? parse(DOMPurify.sanitize(mail?.part_html))
                : mail?.part_text}
            </div>
          </>
        ) : (
          <div onClick={handleDecrypted} className={styles.locked}>
            <img src={locked} className={styles.icon} />
            <div>Click to decrypt this mail.</div>
          </div>
        )}
        <div className={styles.btnBar} onClick={handleClickReply}>
          <Button>Reply</Button>
        </div>
        </div>
    </div>
  );
*/}

}




