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
    purge: true,
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
                    primary: '#3C6FF4',
                },
                dark: {
                    ...require('daisyui/src/theming/themes')['[data-theme=dark]'],
                    primary: '#3C6FF4',
                },
            },
        ],
    },
    theme: {
        extend: {
            fontFamily: {
                poppins: ['Poppins'],
                'space-grotesk': ['"Space Grotesk"'],
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
        },
    },
    plugins: [require('daisyui')],
};
