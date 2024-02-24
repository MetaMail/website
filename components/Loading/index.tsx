import React from 'react';
import styles from './index.module.scss';

interface ILoadingProps {
    show: boolean;
}

export default function Loading({ show }: ILoadingProps) {
    return (
        <div className={`${styles.loadingWrap} ${show ? '' : styles.loadingWrapHide}`}>
            <div className={styles.ctx}>
                <span>Loading...</span>
            </div>
        </div>
    );
}
