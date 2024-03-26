/* eslint-disable react/no-children-prop */
/*
 * @Author: your name
 * @Date: 2024-03-21 10:23:03
 * @LastEditTime: 2024-03-21 14:36:26
 * @LastEditors: 韦玮莹
 * @Description: In User Settings Edit
 * @FilePath: \website\pages\statics\FAQs.tsx
 */

import MDRender from "../../components/MdRender/MdRender";
export default function FAQs() {

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
      <MDRender
        markdownText={markdownText}
      />
    </>

  )
}