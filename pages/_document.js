// pages/_document.js
import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          {/* 添加 meta 标签 */}
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <meta name="description" content="metamail,metaMail,MetaMail,MetaMail邮箱,email, end-to-end encryption, web3, eth, ethereum, privacy"></meta>
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
