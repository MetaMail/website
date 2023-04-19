import React, { useEffect, useRef } from 'react';
import jazzicon from 'jazzicon';
import { getUserInfo } from '@utils/storage/user';

const JazziconGrid:React.FC = () => {
    const containerRef = useRef<HTMLDivElement | null>(null);
  
    useEffect(() => {
        const container = containerRef.current;
        const el = jazzicon(24, Math.round(eval(getUserInfo()?.address??'').toString(16) * 10000000));
        container?.appendChild(el);

        return () => {
            container?.removeChild(el);
          };
    }, []);
  
    return (
          <div ref={containerRef} />
      );
  };

export default JazziconGrid;