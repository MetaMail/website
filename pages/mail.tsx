import React from 'react'
//import { notification, message, PageHeader, Button } from 'antd'
import Image from 'next/image';
import { useRouter } from 'next/router'
import logo_brand from '@assets/inbox_brand.svg';
import logo from '@assets/logo.svg';
import compose from '@assets/inbox_compose.svg';
import MailListItem from 'sections/mailItem';
import turnLeft from '@assets/turnLeft.svg';
import turnRight from '@assets/turnRight.png';
import Collection from '@assets/Collection.svg';
import Delete from '@assets/Delete.svg';
import Read from '@assets/Read.svg';
import Unread from '@assets/Unread.svg';

export default function Mail() {
  //const router = useRouter()
  return (
    <div className='pl-20 py-38 pr-44 font-poppins'>
      <div className='flex flex-row gap-37'>
      <div className='flex flex-col w-170 gap-26'>
            <a href="/" className='flex flex-row gap-9'>
              <Image src={logo} alt="logo" className="w-30 "/>
              <Image src={logo_brand} alt="logo_brand" className="h-29"/>
          </a>
          <div className='flex w-158 h-38 bg-[#006AD4] rounded-11 justify-center gap-17 py-10'>
          <Image src={compose} alt="new_mail" className="w-16 "/>
          <div className='text-sm text-white'>Compose</div>
          </div>
          <div className=''>

          </div>
      </div>
      <div className='relative flex-1 w-0'>
      <div className='flex flex-row pt-10 justify-between'>
        <div className='flex flex-row'><div className='w-6 h-24 bg-[#006AD4] rounded-4'/>
        {/*<span className='pl-7 font-black text-xl'>Inbox</span>*/}</div>
        <div className='w-490 flex flex-row justify-between'>
          <button className='w-294 h-28 bg-[#F3F7FF] border border-[#1e1e1e] rounded-40'>Search</button>
        <span className='omit w-131 text-sm omit font-bold py-8'>0xb3833ffb8fceb3333333333333</span>
        </div>
        </div>
        <div className='flex flex-row justify-between h-50 p-13 text-[#999999]'>
          <div className='flex flex-row space-x-50 px-15'>
            <Image src={Collection} alt={Collection} className="w-81"/>    
            <Image src={Delete} alt={Delete} className="w-59"/>    
            <Image src={Read} alt={Read} className="w-99"/>    
            <Image src={Unread} alt={Unread} className="w-114"/>    


          </div>
        <div className='flex flex-row justify-end space-x-51'>
        <Image src={turnLeft} alt="left" className="w-24"/>
          <div className='text-sm pt-3'>4 / 25</div>
          <Image src={turnRight} alt="right" className="w-24"/>

        </div>
        </div>
        <div className='h-38 flex flex-row py-6 px-18 justify-between text-sm gap-35 text-[#999999] text-center'>
        <div className='flex flex-row justify-around w-102 px-5'>
        <div className="w-12 h-12 border border-[#B3B3B3] rounded-2 content-center mt-4"/>
        <div className=''>Option</div>
        </div>
        <span className='w-120 '>Address</span>
        <span className='w-135 '>Theme</span>
          {/*<div className='h-14 w-1 rounded-1 bg-[#333333] align-center'/>*/}
        <div className='min-w-0 flex-1'>Abstract</div>
        <div className='w-80'>Date</div></div>
        <div className=''>
        <MailListItem />
        <MailListItem />
        <MailListItem />
        <MailListItem />
        <MailListItem />
        <MailListItem />
        <MailListItem />
        <MailListItem />
        <MailListItem />
        <MailListItem />
        </div>
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




