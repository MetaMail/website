import Fivelink from '@components/fivelink';
export default function Footer({}){
    return (
        <footer className='h-262 bg-white flex flex-row justify-between py-83 px-130 '>
          <div className='hidden lg:flex flex-col gap-21'>
            <div className='text-[#0069E5] text-3xl font-black font-poppins'>Metamail</div>
            <div className='w-370 text-3xl font-light leading-tight '>Create And Use Your Crypto Email</div>
            </div>
            <div className='flex flex-row justify-between gap-30 font-poppins'>
              <a className='font-extrabold text-ml pt-10' href='http://www.example.com'>FAQs</a>
            <a className='font-extrabold text-ml pr-20 pt-10' 
            href='http://www.example.com'>Blog</a>
            <div className='flex flex-col gap-23'>
            <Fivelink/>
              <div className='font-normal text-xl flex flex-row justify-between gap-30 text-[#3E3E3E] font-poppins'><a href='http://www.example.com'>Terms of Service</a><a href='http://www.example.com'>Privacy</a>
              </div>
              </div></div>
        </footer>
    );
}