import React from 'react';
import styles from './index.module.scss';

interface ILoadingProps {
  text: string
}

export default function Loading({ text }: ILoadingProps) {
  return (
    <div className={`absolute top-0 left-0 w-[100%] h-[100%] pt-[20%] text-center z-10  `}>
      <span className={`${styles.loader} inline-block`}></span>
    </div>
  );
}
