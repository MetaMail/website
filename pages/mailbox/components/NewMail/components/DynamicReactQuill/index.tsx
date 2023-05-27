import React, { MutableRefObject } from 'react';
import dynamic from 'next/dynamic';
import { StringMap } from 'quill';
import { ReactQuillProps } from 'react-quill';

const DynamicReactQuill = dynamic(
    async () => {
        const { default: RQ } = await import('react-quill');
        var icons = RQ.Quill.import('ui/icons');
        icons['bold'] = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.44043 2.25C2.44043 1.7 2.89043 1.25 3.44043 1.25H6.00043C7.31043 1.25 8.37543 2.315 8.37543 3.625C8.37543 4.935 7.31043 6 6.00043 6H2.44043V2.25Z" stroke="black" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M2.44043 6H7.19043C8.50043 6 9.56543 7.065 9.56543 8.375C9.56543 9.685 8.50043 10.75 7.19043 10.75H3.44043C2.89043 10.75 2.44043 10.3 2.44043 9.75V6V6Z" stroke="black" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
        icons[
            'italic'
        ] = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4.80957 1.5H9.43457" stroke="black" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M2.55957 10.5H7.18457" stroke="black" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M7.125 1.5L4.875 10.5" stroke="black" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
        icons[
            'underline'
        ] = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.5 10.5H9.5" stroke="black" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M2.5 1.5V5C2.5 6.935 4.065 8.5 6 8.5C7.935 8.5 9.5 6.935 9.5 5V1.5" stroke="black" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
        icons['link'] = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.52992 5.47021C7.65492 6.59521 7.65492 8.41522 6.52992 9.53522C5.40492 10.6552 3.58492 10.6602 2.46492 9.53522C1.34492 8.41022 1.33992 6.59021 2.46492 5.47021" stroke="black" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M5.29547 6.70494C4.12547 5.53494 4.12547 3.63494 5.29547 2.45994C6.46547 1.28494 8.36547 1.28994 9.54047 2.45994C10.7155 3.62994 10.7105 5.52994 9.54047 6.70494" stroke="black" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
        icons[
            'strike'
        ] = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0.600098 4.7998H11.4001" stroke="black" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M2.3999 1.2002V5.4002C2.3999 7.72219 4.00962 9.60019 5.9999 9.60019C7.99019 9.60019 9.5999 7.72219 9.5999 5.4002V1.2002" stroke="black" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
        icons[
            'blockquote'
        ] = `<svg width="10" height="12" viewBox="0 0 10 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0.833008 6.17529H3.24967C3.88717 6.17529 4.32468 6.7553 4.32468 7.4653V9.07532C4.32468 9.78532 3.88717 10.3653 3.24967 10.3653H1.90801C1.31635 10.3653 0.833008 9.78532 0.833008 9.07532V6.17529" stroke="black" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M0.833008 6.17511C0.833008 3.15011 1.30385 2.65014 2.72052 1.64014" stroke="black" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M5.6792 6.17529H8.09586C8.73336 6.17529 9.17087 6.7553 9.17087 7.4653V9.07532C9.17087 9.78532 8.73336 10.3653 8.09586 10.3653H6.75421C6.16254 10.3653 5.6792 9.78532 5.6792 9.07532V6.17529" stroke="black" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M5.6792 6.17511C5.6792 3.15011 6.15002 2.65014 7.56669 1.64014" stroke="black" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
        icons[
            'list'
        ].ordered = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 9.5H10" stroke="black" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M5 6H10" stroke="black" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M5 2.5H10" stroke="black" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M2.036 1.906V1.538H2.652V3H2.242V1.906H2.036Z" fill="black"/>
    <path d="M2.066 6.186C2.19533 6.08467 2.30133 5.99733 2.384 5.924C2.46667 5.85067 2.536 5.77533 2.592 5.698C2.648 5.61933 2.676 5.54467 2.676 5.474C2.676 5.43133 2.666 5.398 2.646 5.374C2.62733 5.35 2.59933 5.338 2.562 5.338C2.52333 5.338 2.49333 5.35467 2.472 5.388C2.45067 5.42 2.44067 5.46733 2.442 5.53H2.062C2.066 5.41133 2.092 5.31333 2.14 5.236C2.188 5.15733 2.25067 5.1 2.328 5.064C2.40533 5.02667 2.49133 5.008 2.586 5.008C2.75 5.008 2.872 5.04867 2.952 5.13C3.032 5.21133 3.072 5.31667 3.072 5.446C3.072 5.58467 3.02533 5.71467 2.932 5.836C2.84 5.95733 2.72467 6.066 2.586 6.162H3.086V6.48H2.066V6.186Z" fill="black"/>
    <path d="M2.096 8.8739C2.10133 8.72324 2.148 8.6079 2.236 8.5279C2.324 8.44657 2.44667 8.4059 2.604 8.4059C2.70667 8.4059 2.794 8.4239 2.866 8.4599C2.93933 8.49457 2.99467 8.54257 3.032 8.6039C3.06933 8.6639 3.088 8.7319 3.088 8.8079C3.088 8.89857 3.066 8.97124 3.022 9.0259C2.978 9.07924 2.928 9.11524 2.872 9.1339V9.1419C3.03333 9.2019 3.114 9.31657 3.114 9.4859C3.114 9.5699 3.09467 9.6439 3.056 9.7079C3.01733 9.7719 2.96133 9.8219 2.888 9.8579C2.81467 9.8939 2.72733 9.9119 2.626 9.9119C2.45933 9.9119 2.32733 9.8719 2.23 9.7919C2.134 9.71057 2.084 9.58657 2.08 9.4199H2.462C2.45933 9.47324 2.47067 9.51457 2.496 9.5439C2.52133 9.57324 2.55933 9.5879 2.61 9.5879C2.64867 9.5879 2.67867 9.5759 2.7 9.5519C2.72267 9.5279 2.734 9.4959 2.734 9.4559C2.734 9.40524 2.71733 9.3679 2.684 9.3439C2.652 9.3199 2.59933 9.3079 2.526 9.3079H2.456V8.9899H2.524C2.57467 8.99124 2.61733 8.98324 2.652 8.9659C2.688 8.94724 2.706 8.91057 2.706 8.8559C2.706 8.81457 2.696 8.7839 2.676 8.7639C2.656 8.74257 2.62867 8.7319 2.594 8.7319C2.55533 8.7319 2.52667 8.7459 2.508 8.7739C2.49067 8.80057 2.48067 8.8339 2.478 8.8739H2.096Z" fill="black"/>
    </svg>`;
        icons[
            'list'
        ].bullet = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 9.5H10" stroke="black" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M5 6H10" stroke="black" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M5 2.5H10" stroke="black" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M3.2 2.6C3.2 2.93137 2.93137 3.2 2.6 3.2C2.26863 3.2 2 2.93137 2 2.6C2 2.26863 2.26863 2 2.6 2C2.93137 2 3.2 2.26863 3.2 2.6Z" fill="black"/>
    <path d="M3.2 6.1C3.2 6.43137 2.93137 6.7 2.6 6.7C2.26863 6.7 2 6.43137 2 6.1C2 5.76863 2.26863 5.5 2.6 5.5C2.93137 5.5 3.2 5.76863 3.2 6.1Z" fill="black"/>
    <path d="M3.2 9.6C3.2 9.93137 2.93137 10.2 2.6 10.2C2.26863 10.2 2 9.93137 2 9.6C2 9.26863 2.26863 9 2.6 9C2.93137 9 3.2 9.26863 3.2 9.6Z" fill="black"/>
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
                } & {}
        ) => <RQ ref={props.forwardedRef} {...props} />;
    },
    {
        ssr: false,
    }
);

export default DynamicReactQuill;
