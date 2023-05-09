import React from 'react';
import Image from 'next/image';

interface IIconProps {
  url: any;
  checkedUrl?: any;
  onClick?: (isSelected: boolean) => void;
  className?: any;
  style?: React.CSSProperties;
  imgStyle?: React.CSSProperties;
  select?: boolean;
  tip?: string;
}

export default function Icon({ url, checkedUrl, onClick, className, style, select }: IIconProps) {
  const handleClick = () => {
    onClick?.(!select);
  };

  return (
    <div onClick={handleClick} style={onClick ? { cursor: 'pointer', ...style } : style} className={className}>
      <Image src={!select ? url : checkedUrl ?? url} alt="" />
    </div>
  );
}
