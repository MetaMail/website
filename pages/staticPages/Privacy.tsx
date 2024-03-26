
import MDRender from "./MdRender";
export default function Privacy() {
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