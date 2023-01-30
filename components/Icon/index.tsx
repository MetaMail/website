import React, { useState } from 'react';
//import { Popover } from 'antd';
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

export default function Icon({
  url,
  checkedUrl,
  onClick,
  className,
  style,
  imgStyle,
  select,
  tip,
}: IIconProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(!select);
    }
  };

  return (
    <div
      onClick={handleClick}
      style={onClick ? { cursor: 'pointer', ...style } : style}
      className={className}
    >
      <Image src={!select ? url : checkedUrl ?? url} alt=''/>
    </div>
  );
}
