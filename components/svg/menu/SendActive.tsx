
export default function SendActive({ stroke = "#3C6FF4", size = 18 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 16 16" fill="none">
      <g clipPath="url(#clip0_3190_10775)">
        <path d="M14.6667 1.33301L7.33337 8.66634" stroke={stroke} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14.6667 1.33301L10 14.6663L7.33337 8.66634L1.33337 5.99967L14.6667 1.33301Z" stroke={stroke} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <defs>
        <clipPath id="clip0_3190_10775">
          <rect width={size} height={size} fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
