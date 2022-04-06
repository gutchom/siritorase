import { Head, Html, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html>
      <Head>
        <meta name="theme-color" content="#ffdd88" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9429732150361585"
          crossOrigin="anonymous"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
