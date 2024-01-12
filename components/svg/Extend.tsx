/*
 * @Author: your name
 * @Date: 2024-01-12 13:36:52
 * @LastEditTime: 2024-01-12 13:39:33
 * @LastEditors: 韦玮莹
 * @Description: In User Settings Edit
 * @FilePath: \website\components\svg\Extend.tsx
 */
export const ExtendIcon = ({ stroke = "#7F7F7F" }) => {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10.5 4.5V1.5H7.5"
        stroke={stroke}
        strokeWidth="0.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1.5 7.5V10.5H4.5"
        stroke={stroke}
        strokeWidth="0.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.5 1.5L6.75 5.25"
        stroke={stroke}
        strokeWidth="0.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.25 6.75L1.5 10.5"
        stroke={stroke}
        strokeWidth="0.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
