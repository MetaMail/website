import Avvvatars from 'avvvatars-react'
import { useEffect, useRef } from 'react';
import styles from './index.module.css'
const Avatar = ({ size, addr, className }: { size: number; addr?: string; className?: string }) => {


  return <div className={styles.Avatar_customAvvvatars}><Avvvatars size={size} value={addr} displayValue={addr.charAt(0)} /></div>;
};

export default Avatar;