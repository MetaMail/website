import React from 'react';

export default function LoadingRing() {
    return (
        <div className="absolute top-0 left-0 w-[100%] h-[100%] pt-[10%] text-center bg-white opacity-50">
            <span className="loading loading-ring loading-lg bg-[#006AD4]"></span>
        </div>
    );
}
