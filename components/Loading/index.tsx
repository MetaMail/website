import React from 'react';
import styles from './index.module.scss';

interface ILoadingProps {
  show: boolean;
  text: string
}

export default function Loading({ show, text }: ILoadingProps) {
  return (
    <div className={`${styles.loadingWrap} ${show ? '' : styles.loadingWrapHide}`}>
      <div className={styles.ctx}>
        <span>{text}...</span>
      </div>
    </div>
  );
}
