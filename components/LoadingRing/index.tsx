import React from 'react';
import styles from './index.module.scss';
import { useThemeStore } from 'lib/zustand-store';
import { lightTheme } from '@rainbow-me/rainbowkit';

interface ILoadingProps {
  loading: boolean
}
export default function LoadingRing({ loading }: ILoadingProps) {
  const { isDark } = useThemeStore();
  return (
    // 
    <div className={`absolute top-0 left-0 w-[100%] h-[100%] pt-[20%] text-center z-10  `}>
      <div className='listContainer'> <span className={`${styles.loader} ${!loading ? 'fadeInAnimation' : 'fadeOutAnimation'} inline-block ${isDark ? styles.darkTheme : styles.lightTheme}`} ></span></div>
    </div>
  );
}
