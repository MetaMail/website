import React, { useEffect, useState } from 'react';
import MDRender from '../../components/MdRender/MdRender';

export default function PrivacyPolicyPage() {
  const [markdownText, setMarkdownText] = useState('');

  useEffect(() => {
    fetch('/privacy-policy.md')
      .then(response => response.text())
      .then(text => setMarkdownText(text));
  }, []);

  return (
    <MDRender markdownText={markdownText} />
  );
}
