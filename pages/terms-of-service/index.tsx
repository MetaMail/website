import React, { useEffect, useState } from 'react';
import MDRender from '../../components/MdRender/MdRender';

export default function TermsOfServicePage() {
  const [markdownText, setMarkdownText] = useState('');

  useEffect(() => {
    fetch('/terms-of-service.md')
      .then(response => response.text())
      .then(text => setMarkdownText(text));
  }, []);

  return (
    <MDRender markdownText={markdownText} />
  );
}
