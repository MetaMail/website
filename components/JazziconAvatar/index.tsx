import React, { useEffect, useRef } from 'react';
import jazzicon from 'jazzicon';

const JazziconGrid = ({ size, addr, className }: { size: number; addr?: string; className?: string }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const address = addr?.slice(2, 10);
    const seed = parseInt(address ?? '', 16);
    const container = containerRef.current;
    const el = jazzicon(size, seed);
    container?.appendChild(el);

    return () => {
      container?.removeChild(el);
    };
  }, []);

  return (<div className={`flex items-center  ${className}`} ref={containerRef} />
  );
};

export default JazziconGrid;
