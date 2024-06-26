export default function Deleted({ size = 18, stroke = "#545454" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 4H3.33333H14" stroke={stroke} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.33337 3.99967V2.66634C5.33337 2.31272 5.47385 1.97358 5.7239 1.72353C5.97395 1.47348 6.31309 1.33301 6.66671 1.33301H9.33337C9.687 1.33301 10.0261 1.47348 10.2762 1.72353C10.5262 1.97358 10.6667 2.31272 10.6667 2.66634V3.99967M12.6667 3.99967V13.333C12.6667 13.6866 12.5262 14.0258 12.2762 14.2758C12.0261 14.5259 11.687 14.6663 11.3334 14.6663H4.66671C4.31309 14.6663 3.97395 14.5259 3.7239 14.2758C3.47385 14.0258 3.33337 13.6866 3.33337 13.333V3.99967H12.6667Z" stroke={stroke} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.66663 7.33301V11.333" stroke={stroke} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.33337 7.33301V11.333" stroke={stroke} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
