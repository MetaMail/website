import twitter from '@assets/twitter.svg';
import Image from 'next/image';
import facebook from '@assets/facebook.svg';
import dis from '@assets/discord.png';
import tg from '@assets/telegram.svg';
import git from '@assets/git.png';
export default function Fivelink(){
    return(
    <div className='flex flex-row gap-10'>          
    <a href="http://www.example.com">
    <Image
  src={twitter}
  alt="twitter"
  width={40}
  height={40}
/>
</a>
<a href="http://www.example.com">
<Image
  src={facebook}
  alt="facebook"
  width={40}
  height={40}
/>
</a>
<a href="http://www.example.com">
<Image
  src={tg}
  alt="tg"
  width={40}
  height={40}
/>
</a>
<a href="http://www.example.com">
<Image
  src={git}
  alt="github"
  width={40}
  height={40}
/>
</a>
<a href="http://www.example.com">
<Image
  src={dis}
  alt="discord"
  width={40}
  height={40}
/>
</a></div>
    )
}