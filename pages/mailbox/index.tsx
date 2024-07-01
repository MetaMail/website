import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useMailDetailStore, useMailListStore, useNewMailStore, useSignatureModalStore, useUtilsStore } from 'lib/zustand-store';
import { userHttp, mailHttp } from 'lib/http';
import { MMHttp, PostfixOfAddress } from 'lib/base';
import { IPersonItem, MetaMailTypeEn, MarkTypeEn, MailBoxTypeEn, ReadStatusTypeEn, IMailContentItem } from 'lib/constants';
import { userSessionStorage, userLocalStorage, mailLocalStorage } from 'lib/utils';
import { getPrivateKey, decryptMailKey } from 'lib/encrypt';
import MailBoxContext from 'context/mail';
import Layout from 'components/Layout';
import MailList from 'components/MailList';
import MailDetail from 'components/MailDetail';
import NewMail from 'components/NewMail';
import Loading from 'components/Loading';
import { isEmptyObject } from 'utils';
import LoadingRing from 'components/LoadingRing';
import moment from 'moment';
import DetailMailList from 'components/DetailMailList';
import NormalSignModal from 'components/Modal/SignModal';
export default function MailBoxPage() {
  const router = useRouter();
  const { selectedMail } = useMailDetailStore();
  const { setUnreadCount, setSpamCount } = useMailListStore();
  const { selectedDraft, setSelectedDraft } = useNewMailStore();
  const { removeAllState } = useUtilsStore();
  const [showLoading, setShowLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [signModalShow, setSignModalShow] = useState(false);

  // 签名提示弹窗---start
  const { isShowSignature, setIsShowSignature, message, setMessage } = useSignatureModalStore();
  const handleOpenModal = () => {
    setIsShowSignature(true);
  };

  const handleCloseModal = () => {
    setIsShowSignature(false);
  };
  const handleOnSign = (message: string) => {
    console.log('hand;e')
    setMessage(message);
    handleOpenModal()
  }

  // 签名提示弹窗---end
  const logout = () => {
    userLocalStorage.clearAll();
    mailLocalStorage.clearAll();
    userSessionStorage.clearAll();
    removeAllState();
    router.push('/');
  };
  useEffect(() => {
    MMHttp.onUnAuthHandle = logout;
    if (userLocalStorage.getUserInfo() && userLocalStorage.getUserInfo().address) {
      loadGoogleAnalytics()
    }
  }, []);

  const loadGoogleAnalytics = () => {
    if (document && document.body) {


      // 定义不同域名对应的 GA 测量 ID
      const gaConfigs: any = {
        'https://www.mmail-test.ink': 'G-75FTNMN94W', // 测量 ID 1
        'https://www.metamail.ink': 'G-KCYK0VD85J' // 测量 ID 2
      };

      // 获取当前页面的域名
      const currentDomain = window.location.origin;
      console.log(currentDomain)
      // 获取对应域名的测量 ID
      const measurementId = gaConfigs[currentDomain];

      if (measurementId) {
        console.log('ga执行')
        // 动态创建并加载 GA 脚本
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
        document.body.appendChild(script);

        const gtagScript = document.createElement('script');
        gtagScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${measurementId}', {
          'send_page_view': true,
          'transport_type': 'beacon',
          'linker': {
            'domains': [${currentDomain}]
          }
        });
      `;
        document.body.appendChild(gtagScript);
      } else {
        console.error('当前域名没有配置对应的测量 ID');
      }
    }
  }
  const checkEncryptable = async (receivers: IPersonItem[]) => {
    const getSinglePublicKey = async (receiver: IPersonItem) => {

      try {
        const encryptionData = await userHttp.getEncryptionKey(receiver.address.split('@')[0]);

        return encryptionData.public_key;
      } catch (error) {
        console.error('Failed to get public key of receiver: ', receiver.address);
        console.error(error);
        return '';
      }
    };
    const publicKeys = await Promise.all(receivers.map(receiver => getSinglePublicKey(receiver)));
    return {
      encryptable: receivers.length && publicKeys.every(key => key?.length),
      publicKeys,
    };
  };
  // 拼一下转发邮件
  const handleFormatForwardContent = () => {
    console.log('selectedMail', selectedMail?.mail_from.address)
    return `
        <br>
        <p>---------- Forwarded message ---------</p><br>
        <span>From: ${selectedMail?.mail_from.name}</span>< ${selectedMail?.mail_from.address} >
        <p>Date: ${moment(selectedMail?.mail_date).format('ddd, MMM DD, Y LT')}</p>
        <p>Subject: ${selectedMail?.subject}</p>
        <p>To: ${selectedMail.mail_to?.map(item => `${item.name} <${item.address}>`).join(', ')}</p>
        ${selectedMail.part_html ? selectedMail.part_html : selectedMail.part_text}
      `
  }
  // 创建草稿
  /**
   * 
   * @param mailTo 
   * @param message_id 
   * @param subject 
   * @param selectedMail 
   * @param isForward 是否是转发
   */
  const createDraft = async (mailTo: IPersonItem[], message_id?: string, subject?: string, selectedMail?: IMailContentItem, isForward?: boolean) => {
    const { address, ensName } = userLocalStorage.getUserInfo();
    const mailFrom = {
      address: (ensName || address) + PostfixOfAddress,
      name: ensName || address,
    };
    let selectMailObj: any = {
      mail_from: mailFrom,
      mail_to: isForward ? [] : mailTo,
      mail_cc: [],
      mark: MarkTypeEn.Normal,
      part_html: isForward ? handleFormatForwardContent() : '',
      part_text: '',
      attachments: isForward ? selectedMail.attachments : [],
      subject: '',
      meta_type: MetaMailTypeEn.Encrypted,
      mailbox: MailBoxTypeEn.Draft,
      read: ReadStatusTypeEn.Read,
      digest: '',
      local_id: new Date().toString(),
    }
    if (message_id) {
      // 回复邮件
      selectMailObj.in_reply_to = message_id;
      selectMailObj.subject = 'Re:' + subject;
      if (selectedMail) {
        selectMailObj.origin_part_html = selectedMail.part_html;
        selectMailObj.origin_part_text = selectedMail.part_text;
      }
    };
    // console.log('草稿', selectMailObj)
    setSelectedDraft({ ...selectMailObj });
  };


  const getMailStat = async () => {
    try {
      const { spam, unread } = await mailHttp.getMailStat();
      setUnreadCount(unread);
      setSpamCount(spam);


    } catch (error) {
      console.error('get mail stat error');
      console.error(error);
    }
  };

  const getRandomBits = async (type: 'detail' | 'draft') => {
    let currentKey: string;
    let currentEncryptionPublicKey: string;
    if (type === 'draft') {
      currentKey = selectedDraft.meta_header?.encrypted_encryption_keys?.[0];
      currentEncryptionPublicKey = selectedDraft.meta_header?.encryption_public_keys?.[0];
    } else {
      const keys = selectedMail?.meta_header?.encrypted_encryption_keys;
      const encryption_public_keys = selectedMail?.meta_header?.encryption_public_keys;
      const { address, ensName } = userLocalStorage.getUserInfo();
      const addrList = [
        selectedMail?.mail_from.address,
        ...(selectedMail?.mail_to.map(item => item.address) || []),
        ...(selectedMail?.mail_cc.map(item => item.address) || []),
        ...(selectedMail?.mail_bcc.map(item => item.address) || []),
      ];
      const idx = addrList.findIndex(addr => {
        const prefix = addr?.split('@')[0].toLocaleLowerCase();
        return prefix === address || prefix === ensName;
      });
      if (idx < 0 || idx > keys.length - 1) {
        throw new Error('not find index from address list');
      }
      currentKey = keys[idx];
      currentEncryptionPublicKey = encryption_public_keys[0]; // Use the sender's pubkey to derive randomBits
    }
    if (!currentKey) {
      throw new Error('not find current key');
    }

    let purePrivateKey = userSessionStorage.getPurePrivateKey();
    if (!purePrivateKey) {
      try {
        const { privateKey, salt } = userLocalStorage.getUserInfo();
        console.log('1')
        setMessage(type === 'draft' ? 'Sign this message to write' : 'Sign this message to decrypt this e-mail');
        setIsShowSignature(true)
        purePrivateKey = await getPrivateKey(privateKey, salt);

        userSessionStorage.setPurePrivateKey(purePrivateKey);
      } finally {
        setIsShowSignature(false)
      }
    }
    return decryptMailKey(currentKey, purePrivateKey, currentEncryptionPublicKey);
  };



  return (

    <MailBoxContext.Provider
      value={{ checkEncryptable, createDraft, setShowLoading, logout, getMailStat, getRandomBits }}>
      {isShowSignature && <NormalSignModal />}
      <Layout>
        {/* list */}
        <MailList />
        {
          !!selectedMail && <div className="DetailContainer bg-base-100  absolute left-0 top-0 w-full h-full z-2">
            <DetailMailList /> && <MailDetail />
          </div>
        }
        {selectedDraft && <NewMail />}
      </Layout>
      {/* {show = { showLoading }} */}
      {<LoadingRing loading={showLoading} />}
    </MailBoxContext.Provider>
  );
}
