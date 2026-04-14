import React, { useState } from 'react';
import style from './tootip.module.css';
/**
 * 封装一个提示组件，在流式返回完后调用给用户反馈
 */
export default function usetootip() {
  const [tootip, setTootip] = useState(false);
  const top = (props: string) => {
    return (
      <div className={style.tootip}>
        <div className={style.top}>{props}</div>
      </div>
    );
  };
  return {
    tootip,
    setTootip,
    top,
  };
}
