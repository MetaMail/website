/* eslint-disable react/no-children-prop */
/*
 * @Author: your name
 * @Date: 2024-03-21 10:23:03
 * @LastEditTime: 2024-03-21 14:36:26
 * @LastEditors: 韦玮莹
 * @Description: In User Settings Edit
 * @FilePath: \website\pages\statics\FAQs.tsx
 */

import Markdown from 'react-markdown';
import { routeBack } from 'assets/icons';
import Icon from 'components/Icon';
import { useRouter } from 'next/router';
export default function FAQs() {
  const router = useRouter();
  // --------------------------------------------------------------
  const markdownText = `A
paragraph with *emphasis* and **strong importance**.
# **我们的中间有一个空行。**
# &nbsp;
好像是的。

> A block quote with ~strikethrough~ and a URL: https://reactjs.org.
我们的中间有一个空行。
&nbsp;
好像是的。

* Lists
* [ ] todo
* [x] done

A table:

| a | b |
| - | - |
`;
  // --------------------------------------------------------------
  return (
    <>
      <div className="container max-w-[1024px] min-h-[100vh] mx-auto bg-[#F2F5F8] px-62 text-[#333] text-[16px] pt-56">
        <h2 className="mb-24 text-[#0069E5] text-[34px] font-[PoppinsBold]">Metamail</h2>
        <div className="bg-white p-32">
          <Markdown skipHtml={false} children={markdownText} >
          </Markdown>
        </div>
        <button title='go back' onClick={() => { router.back() }} className='mt-16 text-white text-14 bg-[#0069E5] flex justify-center items-center w-60 h-40 rounded-20'><Icon className='w-20 h-20' url={routeBack}></Icon></button>
      </div>
    </>

  )
}