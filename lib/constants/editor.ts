
export const EditorModules = {
  toolbar: [
    [{ header: [1, 2, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote', 'link', 'ordered', 'bullet'],

  ],
};
export const DarkEditorModules = {
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
];
