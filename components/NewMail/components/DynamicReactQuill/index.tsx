import React, { MutableRefObject } from 'react';
import dynamic from 'next/dynamic';
import { StringMap } from 'quill';
import { ReactQuillProps } from 'react-quill';
import { userLocalStorage } from 'lib/utils';


const DynamicReactQuill = dynamic(
  async () => {
    const localTheme = userLocalStorage.getTheme() || 'light';
    console.log('isDarkisDark', localTheme)
    const { default: RQ } = await import('react-quill');
    var icons = RQ.Quill.import('ui/icons');
    icons['list'].bold = `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
  <path d="M3.37988 3.12484C3.37988 2.3915 3.97988 1.7915 4.71322 1.7915H8.12655C9.87322 1.7915 11.2932 3.2115 11.2932 4.95817C11.2932 6.70484 9.87322 8.12484 8.12655 8.12484H3.37988V3.12484Z" stroke="white" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M3.37988 8.125H9.71322C11.4599 8.125 12.8799 9.545 12.8799 11.2917C12.8799 13.0383 11.4599 14.4583 9.71322 14.4583H4.71322C3.97988 14.4583 3.37988 13.8583 3.37988 13.125V8.125V8.125Z" stroke="white" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`
    icons['bold'] = localTheme === 'dark' ? `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
<path d="M2.44141 2.25C2.44141 1.7 2.89141 1.25 3.44141 1.25H6.00141C7.31141 1.25 8.37641 2.315 8.37641 3.625C8.37641 4.935 7.31141 6 6.00141 6H2.44141V2.25Z" stroke="white" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M2.44141 6H7.19141C8.50141 6 9.56641 7.065 9.56641 8.375C9.56641 9.685 8.50141 10.75 7.19141 10.75H3.44141C2.89141 10.75 2.44141 10.3 2.44141 9.75V6V6Z" stroke="white" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
  <path d="M3.25488 2.99984C3.25488 2.2665 3.85488 1.6665 4.58822 1.6665H8.00155C9.74822 1.6665 11.1682 3.0865 11.1682 4.83317C11.1682 6.57984 9.74822 7.99984 8.00155 7.99984H3.25488V2.99984Z" stroke="black" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M3.25488 8H9.58822C11.3349 8 12.7549 9.42 12.7549 11.1667C12.7549 12.9133 11.3349 14.3333 9.58822 14.3333H4.58822C3.85488 14.3333 3.25488 13.7333 3.25488 13V8V8Z" stroke="black" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
    // 斜体
    icons['list'].italic = `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
  <path d="M6.53711 2.125H12.7038" stroke="white" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M3.53711 14.125H9.70378" stroke="white" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M9.625 2.125L6.625 14.125" stroke="white" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`
    icons[
      'italic'
    ] = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
<path d="M6.41211 2H12.5788" stroke="black" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M3.41211 14H9.57878" stroke="black" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M9.5 2L6.5 14" stroke="black" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
    // 下划线
    icons['list'].underline = `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
  <path d="M3.45801 14.125H12.7913" stroke="white" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M3.45801 2.125V6.79167C3.45801 9.37167 5.54467 11.4583 8.12467 11.4583C10.7047 11.4583 12.7913 9.37167 12.7913 6.79167V2.125" stroke="white" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`
    icons[
      'underline'
    ] = localTheme === 'dark' ? `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
<path d="M2.5 10.5H9.5" stroke="white" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M2.5 1.5V5C2.5 6.935 4.065 8.5 6 8.5C7.935 8.5 9.5 6.935 9.5 5V1.5" stroke="white" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
  <path d="M3.33301 14H12.6663" stroke="black" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M3.33301 2V6.66667C3.33301 9.24667 5.41967 11.3333 7.99967 11.3333C10.5797 11.3333 12.6663 9.24667 12.6663 6.66667V2" stroke="black" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
    // 删除线
    icons['list'].strike = `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
  <path d="M0.925781 6.5249H15.3258" stroke="white" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M3.32422 1.7251V7.3251C3.32422 10.4211 5.4705 12.9251 8.12422 12.9251C10.7779 12.9251 12.9242 10.4211 12.9242 7.3251V1.7251" stroke="white" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`
    icons[
      'strike'
    ] = localTheme === 'dark' ? `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
<path d="M0.599609 4.7998H11.3996" stroke="white" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M2.40039 1.2002V5.4002C2.40039 7.72219 4.0101 9.60019 6.00039 9.60019C7.99068 9.60019 9.60039 7.72219 9.60039 5.4002V1.2002" stroke="white" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
  <path d="M0.800781 6.3999H15.2008" stroke="black" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M3.19922 1.6001V7.2001C3.19922 10.2961 5.3455 12.8001 7.99922 12.8001C10.6529 12.8001 12.7992 10.2961 12.7992 7.2001V1.6001" stroke="black" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
    icons['list'].blockquote = `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
  <path d="M1.45898 8.35889H5.32564C6.34564 8.35889 7.04565 9.13223 7.04565 10.0789V12.2256C7.04565 13.1723 6.34564 13.9456 5.32564 13.9456H3.179C2.23233 13.9456 1.45898 13.1723 1.45898 12.2256V8.35889" stroke="white" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M1.45898 8.35864C1.45898 4.32531 2.21234 3.65868 4.479 2.31201" stroke="white" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M9.21191 8.35889H13.0786C14.0986 8.35889 14.7986 9.13223 14.7986 10.0789V12.2256C14.7986 13.1723 14.0986 13.9456 13.0786 13.9456H10.9319C9.98526 13.9456 9.21191 13.1723 9.21191 12.2256V8.35889" stroke="white" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M9.21191 8.35864C9.21191 4.32531 9.96523 3.65868 12.2319 2.31201" stroke="white" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`
    icons[
      'blockquote'
    ] = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
  <path d="M1.33398 8.23389H5.20064C6.22064 8.23389 6.92065 9.00723 6.92065 9.9539V12.1006C6.92065 13.0473 6.22064 13.8206 5.20064 13.8206H3.054C2.10733 13.8206 1.33398 13.0473 1.33398 12.1006V8.23389" stroke="black" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M1.33398 8.23364C1.33398 4.20031 2.08734 3.53368 4.354 2.18701" stroke="black" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M9.08691 8.23389H12.9536C13.9736 8.23389 14.6736 9.00723 14.6736 9.9539V12.1006C14.6736 13.0473 13.9736 13.8206 12.9536 13.8206H10.8069C9.86026 13.8206 9.08691 13.0473 9.08691 12.1006V8.23389" stroke="black" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M9.08691 8.23364C9.08691 4.20031 9.84023 3.53368 12.1069 2.18701" stroke="black" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
    icons['list'].ordered = `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
  <path fill-rule="evenodd" clip-rule="evenodd" d="M5.63477 13.1033C5.63477 12.8548 5.83624 12.6533 6.08477 12.6533H12.7514C13 12.6533 13.2014 12.8548 13.2014 13.1033C13.2014 13.3518 13 13.5533 12.7514 13.5533H6.08477C5.83624 13.5533 5.63477 13.3518 5.63477 13.1033Z" fill="white"/>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M5.63477 8.43633C5.63477 8.1878 5.83624 7.98633 6.08477 7.98633H12.7514C13 7.98633 13.2014 8.1878 13.2014 8.43633C13.2014 8.68486 13 8.88633 12.7514 8.88633H6.08477C5.83624 8.88633 5.63477 8.68486 5.63477 8.43633Z" fill="white"/>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M5.63477 3.76982C5.63477 3.5213 5.83624 3.31982 6.08477 3.31982H12.7514C13 3.31982 13.2014 3.5213 13.2014 3.76982C13.2014 4.01835 13 4.21982 12.7514 4.21982H6.08477C5.83624 4.21982 5.63477 4.01835 5.63477 3.76982Z" fill="white"/>
  <path d="M2.125 2.539V2.125H2.818V3.76975H2.35675V2.539H2.125Z" fill="white"/>
  <path d="M2.1588 8.08306C2.3043 7.96906 2.42355 7.87081 2.51655 7.78831C2.60955 7.70581 2.68755 7.62106 2.75055 7.53406C2.81355 7.44556 2.84505 7.36156 2.84505 7.28206C2.84505 7.23406 2.8338 7.19656 2.8113 7.16956C2.7903 7.14256 2.7588 7.12906 2.7168 7.12906C2.6733 7.12906 2.63955 7.14781 2.61555 7.18531C2.59155 7.22131 2.5803 7.27456 2.5818 7.34506H2.1543C2.1588 7.21156 2.18805 7.10131 2.24205 7.01431C2.29605 6.92581 2.36655 6.86131 2.45355 6.82081C2.54055 6.77881 2.6373 6.75781 2.7438 6.75781C2.9283 6.75781 3.06555 6.80356 3.15555 6.89506C3.24555 6.98656 3.29055 7.10506 3.29055 7.25056C3.29055 7.40656 3.23805 7.55281 3.13305 7.68931C3.02955 7.82581 2.8998 7.94806 2.7438 8.05606H3.3063V8.41381H2.1588V8.08306Z" fill="white"/>
  <path d="M2.1928 11.8151C2.1988 11.6456 2.2513 11.5158 2.3503 11.4258C2.4493 11.3343 2.5873 11.2886 2.7643 11.2886C2.8798 11.2886 2.97805 11.3088 3.05905 11.3493C3.14155 11.3883 3.2038 11.4423 3.2458 11.5113C3.2878 11.5788 3.3088 11.6553 3.3088 11.7408C3.3088 11.8428 3.28405 11.9246 3.23455 11.9861C3.18505 12.0461 3.1288 12.0866 3.0658 12.1076V12.1166C3.2473 12.1841 3.33805 12.3131 3.33805 12.5036C3.33805 12.5981 3.3163 12.6813 3.2728 12.7533C3.2293 12.8253 3.1663 12.8816 3.0838 12.9221C3.0013 12.9626 2.90305 12.9828 2.78905 12.9828C2.60155 12.9828 2.45305 12.9378 2.34355 12.8478C2.23555 12.7563 2.1793 12.6168 2.1748 12.4293H2.60455C2.60155 12.4893 2.6143 12.5358 2.6428 12.5688C2.6713 12.6018 2.71405 12.6183 2.77105 12.6183C2.81455 12.6183 2.8483 12.6048 2.8723 12.5778C2.8978 12.5508 2.91055 12.5148 2.91055 12.4698C2.91055 12.4128 2.8918 12.3708 2.8543 12.3438C2.8183 12.3168 2.75905 12.3033 2.67655 12.3033H2.5978V11.9456H2.6743C2.7313 11.9471 2.7793 11.9381 2.8183 11.9186C2.8588 11.8976 2.87905 11.8563 2.87905 11.7948C2.87905 11.7483 2.8678 11.7138 2.8453 11.6913C2.8228 11.6673 2.79205 11.6553 2.75305 11.6553C2.70955 11.6553 2.6773 11.6711 2.6563 11.7026C2.6368 11.7326 2.62555 11.7701 2.62255 11.8151H2.1928Z" fill="white"/>
</svg>`
    icons[
      'ordered'
    ] = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<g id="Group 48291">
<g id="task">
<path id="Vector (Stroke)" fill-rule="evenodd" clip-rule="evenodd" d="M5.50977 12.9783C5.50977 12.7298 5.71124 12.5283 5.95977 12.5283H12.6264C12.875 12.5283 13.0764 12.7298 13.0764 12.9783C13.0764 13.2268 12.875 13.4283 12.6264 13.4283H5.95977C5.71124 13.4283 5.50977 13.2268 5.50977 12.9783Z" fill="black"/>
<path id="Vector (Stroke)_2" fill-rule="evenodd" clip-rule="evenodd" d="M5.50977 8.31133C5.50977 8.0628 5.71124 7.86133 5.95977 7.86133H12.6264C12.875 7.86133 13.0764 8.0628 13.0764 8.31133C13.0764 8.55986 12.875 8.76133 12.6264 8.76133H5.95977C5.71124 8.76133 5.50977 8.55986 5.50977 8.31133Z" fill="black"/>
<path id="Vector (Stroke)_3" fill-rule="evenodd" clip-rule="evenodd" d="M5.50977 3.64482C5.50977 3.3963 5.71124 3.19482 5.95977 3.19482H12.6264C12.875 3.19482 13.0764 3.3963 13.0764 3.64482C13.0764 3.89335 12.875 4.09482 12.6264 4.09482H5.95977C5.71124 4.09482 5.50977 3.89335 5.50977 3.64482Z" fill="black"/>
<path id="1" d="M2 2.414V2H2.693V3.64475H2.23175V2.414H2Z" fill="black"/>
<path id="2" d="M2.0338 7.95806C2.1793 7.84406 2.29855 7.74581 2.39155 7.66331C2.48455 7.58081 2.56255 7.49606 2.62555 7.40906C2.68855 7.32056 2.72005 7.23656 2.72005 7.15706C2.72005 7.10906 2.7088 7.07156 2.6863 7.04456C2.6653 7.01756 2.6338 7.00406 2.5918 7.00406C2.5483 7.00406 2.51455 7.02281 2.49055 7.06031C2.46655 7.09631 2.4553 7.14956 2.4568 7.22006H2.0293C2.0338 7.08656 2.06305 6.97631 2.11705 6.88931C2.17105 6.80081 2.24155 6.73631 2.32855 6.69581C2.41555 6.65381 2.5123 6.63281 2.6188 6.63281C2.8033 6.63281 2.94055 6.67856 3.03055 6.77006C3.12055 6.86156 3.16555 6.98006 3.16555 7.12556C3.16555 7.28156 3.11305 7.42781 3.00805 7.56431C2.90455 7.70081 2.7748 7.82306 2.6188 7.93106H3.1813V8.28881H2.0338V7.95806Z" fill="black"/>
<path id="3" d="M2.0678 11.6901C2.0738 11.5206 2.1263 11.3908 2.2253 11.3008C2.3243 11.2093 2.4623 11.1636 2.6393 11.1636C2.7548 11.1636 2.85305 11.1838 2.93405 11.2243C3.01655 11.2633 3.0788 11.3173 3.1208 11.3863C3.1628 11.4538 3.1838 11.5303 3.1838 11.6158C3.1838 11.7178 3.15905 11.7996 3.10955 11.8611C3.06005 11.9211 3.0038 11.9616 2.9408 11.9826V11.9916C3.1223 12.0591 3.21305 12.1881 3.21305 12.3786C3.21305 12.4731 3.1913 12.5563 3.1478 12.6283C3.1043 12.7003 3.0413 12.7566 2.9588 12.7971C2.8763 12.8376 2.77805 12.8578 2.66405 12.8578C2.47655 12.8578 2.32805 12.8128 2.21855 12.7228C2.11055 12.6313 2.0543 12.4918 2.0498 12.3043H2.47955C2.47655 12.3643 2.4893 12.4108 2.5178 12.4438C2.5463 12.4768 2.58905 12.4933 2.64605 12.4933C2.68955 12.4933 2.7233 12.4798 2.7473 12.4528C2.7728 12.4258 2.78555 12.3898 2.78555 12.3448C2.78555 12.2878 2.7668 12.2458 2.7293 12.2188C2.6933 12.1918 2.63405 12.1783 2.55155 12.1783H2.4728V11.8206H2.5493C2.6063 11.8221 2.6543 11.8131 2.6933 11.7936C2.7338 11.7726 2.75405 11.7313 2.75405 11.6698C2.75405 11.6233 2.7428 11.5888 2.7203 11.5663C2.6978 11.5423 2.66705 11.5303 2.62805 11.5303C2.58455 11.5303 2.5523 11.5461 2.5313 11.5776C2.5118 11.6076 2.50055 11.6451 2.49755 11.6901H2.0678Z" fill="black"/>
</g>
</g>
</svg>
`;

    // 无序表
    icons['list'].bullet = `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
  <path d="M6.79199 12.7915H13.4587" stroke="white" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M6.79199 8.125H13.4587" stroke="white" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M6.79199 3.4585H13.4587" stroke="white" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M4.39199 3.5915C4.39199 4.03333 4.03382 4.3915 3.59199 4.3915C3.15016 4.3915 2.79199 4.03333 2.79199 3.5915C2.79199 3.14968 3.15016 2.7915 3.59199 2.7915C4.03382 2.7915 4.39199 3.14968 4.39199 3.5915Z" fill="white"/>
  <path d="M4.39199 8.2585C4.39199 8.70032 4.03382 9.0585 3.59199 9.0585C3.15016 9.0585 2.79199 8.70032 2.79199 8.2585C2.79199 7.81667 3.15016 7.4585 3.59199 7.4585C4.03382 7.4585 4.39199 7.81667 4.39199 8.2585Z" fill="white"/>
  <path d="M4.39199 12.925C4.39199 13.3668 4.03382 13.725 3.59199 13.725C3.15016 13.725 2.79199 13.3668 2.79199 12.925C2.79199 12.4832 3.15016 12.125 3.59199 12.125C4.03382 12.125 4.39199 12.4832 4.39199 12.925Z" fill="white"/>
</svg>`
    icons[
      'bullet'
    ] = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
  <path d="M6.66699 12.6665H13.3337" stroke="black" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M6.66699 8H13.3337" stroke="black" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M6.66699 3.3335H13.3337" stroke="black" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M4.26699 3.4665C4.26699 3.90833 3.90882 4.2665 3.46699 4.2665C3.02516 4.2665 2.66699 3.90833 2.66699 3.4665C2.66699 3.02468 3.02516 2.6665 3.46699 2.6665C3.90882 2.6665 4.26699 3.02468 4.26699 3.4665Z" fill="black"/>
  <path d="M4.26699 8.1335C4.26699 8.57532 3.90882 8.9335 3.46699 8.9335C3.02516 8.9335 2.66699 8.57532 2.66699 8.1335C2.66699 7.69167 3.02516 7.3335 3.46699 7.3335C3.90882 7.3335 4.26699 7.69167 4.26699 8.1335Z" fill="black"/>
  <path d="M4.26699 12.8C4.26699 13.2418 3.90882 13.6 3.46699 13.6C3.02516 13.6 2.66699 13.2418 2.66699 12.8C2.66699 12.3582 3.02516 12 3.46699 12C3.90882 12 4.26699 12.3582 4.26699 12.8Z" fill="black"/>
</svg>`;
    // a链接
    icons[
      'list'
    ].link = `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
  <path d="M8.83156 7.41895C10.3316 8.91895 10.3316 11.3456 8.83156 12.8389C7.33156 14.3323 4.9049 14.3389 3.41156 12.8389C1.91823 11.3389 1.91156 8.91228 3.41156 7.41895" stroke="white" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M7.18465 9.06443C5.62465 7.50443 5.62465 4.9711 7.18465 3.40443C8.74465 1.83777 11.278 1.84443 12.8446 3.40443C14.4113 4.96443 14.4046 7.49777 12.8446 9.06443" stroke="white" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`
    icons[
      'link'
    ] = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
  <path d="M8.70656 7.29395C10.2066 8.79395 10.2066 11.2206 8.70656 12.7139C7.20656 14.2073 4.7799 14.2139 3.28656 12.7139C1.79323 11.2139 1.78656 8.78728 3.28656 7.29395" stroke="black" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M7.05965 8.93943C5.49965 7.37943 5.49965 4.8461 7.05965 3.27943C8.61965 1.71277 11.153 1.71943 12.7196 3.27943C14.2863 4.83943 14.2796 7.37277 12.7196 8.93943" stroke="black" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

    return (
      props: JSX.IntrinsicAttributes &
        JSX.IntrinsicClassAttributes<import('react-quill')> &
        Pick<
          Readonly<ReactQuillProps>,
          | 'bounds'
          | 'children'
          | 'className'
          | 'defaultValue'
          | 'formats'
          | 'id'
          | 'onChange'
          | 'onChangeSelection'
          | 'onFocus'
          | 'onBlur'
          | 'onKeyDown'
          | 'onKeyPress'
          | 'onKeyUp'
          | 'placeholder'
          | 'preserveWhitespace'
          | 'scrollingContainer'
          | 'style'
          | 'tabIndex'
          | 'value'
        > & {
          readonly modules?: StringMap;
          readonly readOnly?: boolean;
          readonly theme?: string;
          forwardedRef?: MutableRefObject<any>;
        } & { key: number }
    ) => <RQ ref={props.forwardedRef}
      {...props}
      // 在这里根据主题设置不同的图标
      modules={{
        ...props.modules,
      }}
      />;
  },
  {
    ssr: false,
  }
);

export default DynamicReactQuill;
