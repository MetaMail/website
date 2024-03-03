/** @type {import('tailwindcss').Config} */
const gen =
    (valueProcessor = v => v, keyProcessor = v => v) =>
    l =>
        l
            .map(i => [keyProcessor(i), valueProcessor(i)])
            .reduce((acc, [i, v]) => {
                acc[i] = v;
                return acc;
            }, {});

const ALL_SIZE = [...Array(1441).keys()];
const PERCENT_SIZE = [...Array(101).keys()];

module.exports = {
    darkMode: 'class',
    purge: true,
    important:true,
    content: ['./pages/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './sections/**/*.{ts,tsx}'],
    variants: {
        extend: {
            backgroundColor: ['active'],
        },
    },
    daisyui: {
        themes: [
            {
                light: {
                    ...require('daisyui/src/theming/themes')['[data-theme=light]'],
                    "primary": '#3C6FF4',
                    "neutral":"#9EBFFF",
                    "neutral-content":"#3C6FF4",
                    "base-100":"#ffffff",
                    "base-200":"#EDF3FF",
                    "base-300":"#CADCFF",
                    "base-content":"#333333",
                    "primary-content":"#ffffff"
                },
                dark: {
                    ...require('daisyui/src/theming/themes')['[data-theme=dark]'],
                    "primary": '#3C6FF4',
                    "neutral":"#E7E7E7",
                    "base-300":"#E7E7E7",
                    "base-200":"#262626",
                    "base-100":"#1F1F1F",
                    "base-content":"#ffffff",
                    "neutral-content":"#ffffff",
                    "tw-bg-opacity":'1',
                },
            },
        ],
    },
    theme: {
        extend: {
          keyframes:{
            hoverSlider:{
              from :{ backgroundColor: '#fff'},
              to:{backgroundColor:'red'}
              // CADCFF
            }
          },
            fontFamily: {
                poppins: ['Poppins,Roboto, Helvetica, Arial, sans-serif'],
                spaceGrotesk: ['SpaceGrotesk'],
            },
            fontSize: {
                sm: ['12px', '18px'],
                xs: ['10px', '15px'],
                md: ['14px', '21px'],
            },
            backgroundImage: {
                filter: "url('/assets/icons/filter.svg')",
            },
            spacing: {
                ...gen(v => `${v}px`)(ALL_SIZE),
                ...gen(
                    v => `${v}%`,
                    k => `${k}p`
                )(PERCENT_SIZE),
            },
            width: theme => ({
                ...theme('spacing'),
            }),
            height: theme => ({
                ...theme('spacing'),
            }),
            margin: theme => ({
                ...theme('spacing'),
            }),
            borderRadius: {
                ...gen(v => `${v}px`)(PERCENT_SIZE),
            },
            colors:{
              
                "lightMailAddressRead":'#444',//浅色模式下，已读，发件人地址
                "lightMailAddressUnRead":'#222',//浅色模式下，未读，发件人地址
                "lightMailTitleRead":'#444',//浅色模式下，已读，title
                "lightMailTitleUnRead":'#222',//浅色模式下，未读，title
                 "lightMailDetailRead":'#a2a2a2',//浅色模式下，已读，邮件详情
                "lightMailDetailUnRead":'#444',//浅色模式下，未读，邮件详情
                  "lightMailDate":'#a2a2a2',// 浅色式下，查看邮件详情时邮件列表address旁边的日期
                 "lightMailContent":"#222", //邮件正文
                // ----------------------------
                "DarkMailAddressRead":'#d6d6d6',//深模式下，已读，发件人地址
                "DarkMailAddressUnRead":'#f6f6f6',//深模式下，未读，发件人地址
                "DarkMailTitleRead":'#d6d6d6',//深模式下，已读，title
                "DarkMailTitleUnRead":'#f6f6f6',//深模式下，未读，title
                "DarkMailDetailRead":'#b6b6b6',//深模式下，已读，邮件详情
                "DarkMailDetailUnRead":'#f6f6f6',//深模式下，未读，邮件详情
                "DarkMailDate":'#b6b6b6', // 深模式下，查看邮件详情时邮件列表address旁边的日期
                "DarkMailContent":"#f6f6f6", //深模式下，邮件正文
                // ----------------------------

                "lightGrayBg": "#0700200A"
            }
        },
    },
    plugins: [require('daisyui')],
};
