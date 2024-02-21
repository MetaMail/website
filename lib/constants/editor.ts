
const commonModules = {
  toolbar: true,
  history: false, // 禁用历史记录
  // 禁用内容过滤
  clipboard: {
    matchVisual: false, // 禁用视觉匹配
  },
  // 禁用内容过滤
  sanitize: false,
}
export const EditorModules = {
  ...commonModules,
  toolbar: [
    [{ header: [1, 2, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote', 'link', 'ordered', 'bullet'],

  ],
};
export const DarkEditorModules = {
  ...commonModules,
  toolbar: [
    [{ header: [1, 2, false] }],
    [
      { list: 'bold' },
      { list: 'italic' },
      { list: 'underline' },
      { list: 'strike' },
      { list: 'blockquote' },
      { list: 'link' },
      { list: 'ordered' },
      { list: 'bullet' }
    ],
    //['clean'],
  ],
};
export const EditorFormats = [
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'blockquote',
  'list',
  'bullet',
  'indent',
  'link',
  'style',
  'a',
  'p',
  'br',
  'div'
];
