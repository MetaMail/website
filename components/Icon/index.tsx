import React from 'react';
import Image from 'next/image';

interface IIconProps {
    url: any;
    className?: string;
    title?: string;
    onClick?: (e: React.MouseEvent) => void;
}

export default function Icon({ url, title, className, onClick }: IIconProps) {
    return (
        <div className={className} title={title} onClick={onClick}>
            <Image className="w-full h-full cursor-pointer" src={url} alt="" />
        </div>
    );
}
