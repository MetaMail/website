import Avvvatars from 'avvvatars-react'
import { useEffect, useRef } from 'react';
const Avatar = ({ size, addr, className }: { size: number; addr?: string; className?: string }) => {


  return <Avvvatars value={addr} />;
};

export default Avatar;