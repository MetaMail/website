export default function DraftSvg({ size = 18, stroke = "#545454" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clip-path="url(#clip0_3089_9947)">
        <path d="M7.33337 2.66699H2.66671C2.31309 2.66699 1.97395 2.80747 1.7239 3.05752C1.47385 3.30756 1.33337 3.6467 1.33337 4.00033V13.3337C1.33337 13.6873 1.47385 14.0264 1.7239 14.2765C1.97395 14.5265 2.31309 14.667 2.66671 14.667H12C12.3537 14.667 12.6928 14.5265 12.9428 14.2765C13.1929 14.0264 13.3334 13.6873 13.3334 13.3337V8.66699" stroke={stroke} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12.3334 1.66714C12.5986 1.40193 12.9583 1.25293 13.3334 1.25293C13.7084 1.25293 14.0682 1.40193 14.3334 1.66714C14.5986 1.93236 14.7476 2.29207 14.7476 2.66714C14.7476 3.04222 14.5986 3.40193 14.3334 3.66714L8.00004 10.0005L5.33337 10.6671L6.00004 8.00048L12.3334 1.66714Z" stroke={stroke} strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <defs>
        <clipPath id="clip0_3089_9947">
          <rect width={size} height={size} fill="white" />
        </clipPath>
      </defs>
    </svg>

  );
}
