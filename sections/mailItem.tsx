import Image from 'next/image';
import encrypt from '@assets/encrypt.svg';
interface IMailItemProps {
    subject: string;
    from: string;//IPersonItem;
    date: string;
    isRead: boolean;
    select?: boolean;
    mark?: string;//MarkTypeEn;
    metaType?: string;//MetaMailTypeEn;
    abstract?: string;
    onClick: () => void;
    onSelect: (isSelected: boolean) => void;
    onFavorite: (isSelected: boolean) => void;
}





export default function MailListItem()//({
    //subject,
    //from,
    //date,
    //isRead,
    //onClick,
    //onSelect,
    //onFavorite,
    //select,
    //mark,
    //metaType,
    //abstract,
  //}: IMailItemProps) 
  {
    return (
      <div className='h-38 flex flex-row py-6 px-18 justify-between text-sm gap-35'>
        <div className='flex flex-row gap-15'>
        <div className="form-control">
          <label className="label cursor-pointer py-6 ">
            <input type="checkbox" className="checkbox checkbox-xs rounded-4" />
          </label>
        </div>
        <Image src={encrypt} alt="new_mail" className="w-24 "/>
        <Image src={encrypt} alt="new_mail" className="w-24 "/>
        </div>
        <span className='pt-2 text-[#333333] omit w-120 '>0x7d869043f32ffd3297915ec8710b203a16802cf9@mmail.ink</span>
        <span className='pt-2 text-[#333333] omit w-135 '>Theme of the mail</span>
          {/*<div className='h-14 w-1 rounded-1 bg-[#333333] align-center'/>*/}
        <div className='pt-2 text-[#999999] omit min-w-0 flex-1'>Abstract of the mail like what they want. This Is Not a Game | BanklessDAO Weekly Rollup. In recent weeks, many of our contributors have turned the spotlight onto Coordinape, which has long been integral as our reward and recognition system for ‘ad-hoc contributions’ to the DAO. This week, the editorial by Tomahawk provides a sobering insight into some of the suspicious behavior, and most recently, outright fraud, that has plagued the DAO’s Coordinape rounds over the last few months.</div>
        <div className='pt-2 text-[#999999]'>2022/02/04</div>
      </div>
    );
    }