import React, { useEffect, useState } from 'react';
import MDRender from '../../components/MdRender/MdRender';

export default function FAQsPage() {
  const [markdownText, setMarkdownText] = useState('');

  useEffect(() => {
    fetch('/FAQs.md')
      .then(response => response.text())
      .then(text => setMarkdownText(text));
  }, []);

  return (
    <MDRender markdownText={markdownText} />
  );
}
