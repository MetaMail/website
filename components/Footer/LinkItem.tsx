import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface ILinkItemProps {
  href: string;
  logo: string;
  alt: string;
  target?: string
}

export default function LinkItem({ href, logo, alt, target = '_self' }: ILinkItemProps) {
  return (
    <Link href={href} target={target}>
      <Image src={logo} alt={alt} width={40} height={40} />
    </Link>
  );
}
