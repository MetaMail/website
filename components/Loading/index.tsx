import React from 'react';
import styles from './index.module.scss';

interface ILoadingProps {
    show: boolean;
}

export default function Loading({ show }: ILoadingProps) {
    return (
        <div className={`${styles.loadingWrap} ${show ? '' : styles.loadingWrapHide}`}>
            <div className={styles.ctx}>
                <span>正在加载...</span>
            </div>
        </div>
    );
}
