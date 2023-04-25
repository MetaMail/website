import React, { useEffect, useRef } from 'react';
import jazzicon from 'jazzicon';
import { getUserInfo } from '@utils/storage/user';

const JazziconGrid = ({ size, addr }: { size: number, addr?:string}) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        const address = addr?.slice(2,10)
        const seed = parseInt(address??'', 16);
        const container = containerRef.current;
        const el = jazzicon(size, seed);
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