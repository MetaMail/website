export default function SpamSvg({ size = 16, stroke = "#545454" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 16 16" fill="none">
      <g clipPath="url(#clip0_3189_10734)">
        <path d="M8.00004 14.6663C11.6819 14.6663 14.6667 11.6816 14.6667 7.99967C14.6667 4.31778 11.6819 1.33301 8.00004 1.33301C4.31814 1.33301 1.33337 4.31778 1.33337 7.99967C1.33337 11.6816 4.31814 14.6663 8.00004 14.6663Z" stroke={stroke} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 6L6 10" stroke={stroke} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 6L10 10" stroke={stroke} strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <defs>
        <clipPath id="clip0_3189_10734">
          <rect width={size} height={size} fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
