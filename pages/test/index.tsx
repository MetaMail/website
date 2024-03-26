import React, { useEffect, useState } from 'react'

function Demo() {
  const [count, setCount] = useState(0)
  /**
   * @@@ 无依赖项 
   * 第一次加载---执行return外的部分
   * 每次更新会先执行rerurn内部分，再执行return外部分
   */
  useEffect(() => {
    console.log('无依赖---------------------------', count)
    return () => {
      console.log('执行  无依赖  时的return的函数')
    }
  })
  /**
 * @@@ 依赖项为[] 
 * 第一次加载---执行第一个参数的函数，类似于执行componentDidMount，且只执行一遍，
 * return 函数会在页面销毁或者移除组件的时候执行，类似componentWillUnMount
 */
  useEffect(() => {
    console.log('依赖为[]------------------------', count)
    return () => {
      console.log('执行 依赖为[]  时的return的函数')
    }
  }, [])
  /**
   * @@@ 依赖项不为空的时候
   * 页面一进来会执行第一个函数return外的部分，每次依赖更新会先执行return内的部分再执行return外的部分
   */
  useEffect(() => {
    console.log('依赖为[count]------------------------', count)
    return () => {
      console.log('执行 依赖为[count]  时的return的函数')
    }
  }, [count])
  return (
    <div>
      <p>count的值为： {count} </p>
      <button onClick={() => setCount(count + 1)}>add</button>
    </div>
  )
}

export default Demo
