import React from 'react';

interface IDotProps {
  size?: number;
  color?: string;
}

export default function Dot({ size = 6, color = '#006AD4' }: IDotProps) {
  return (
    <span
      className="rounded-full inline-block"
      style={{ width: size, height: size, backgroundColor: color }}></span>
  );
}
