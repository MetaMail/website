import { swapAddr } from "@assets/icons";
import { PostfixOfAddress } from "@utils/request";
import { getUserInfo, saveShowName } from "@utils/storage/user";
import { useState } from "react";
import Icon from "./Icon";
function NameSelecter(){
    const { showName, ensName, address} = getUserInfo();
    const [activeName, setActiveName] = useState(showName);
    const [isAddrListHidden, setIsAddrListHidden] = useState(true);
    const DropItem = ({ name }: { name?: string }) => {
    return name ? (
      <div
        className="hover:bg-[#DAE7FF] px-11 py-5 cursor-pointer"
        onClick={() => {
          saveShowName(name);
          setActiveName(name);
          setIsAddrListHidden(true);
        }}
      >
        <div id="name">
          {name + PostfixOfAddress}
        </div>

      </div>
    ) : null;
  };


  return(
    <div className="pl-[4%]">
        <span className="dropdown inline-relative gap-10">
            <div className="flex gap-10">
            <span>{activeName + PostfixOfAddress}</span>
            {ensName?<Icon      ///////////最初设计稿的提示
            url={swapAddr}
            onClick={()=>
          setIsAddrListHidden(!isAddrListHidden)
            }
            />:null}
            </div>
                <ul className={isAddrListHidden?'hidden':'flex z-[2] menu absolute mt-6 shadow bg-base-100 rounded-5'}>
                    <DropItem name={address} />
                    {ensName?<DropItem name={ensName} />:null}
                </ul>
              </span>

    </div>


  )
}
export default NameSelecter;