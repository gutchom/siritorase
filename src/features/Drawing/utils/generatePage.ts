import type { PostItem } from '../types';

export default function generatePage(
  id: string,
  digest: string[],
  history: PostItem[],
): string {
  const title = [...digest, '？？？'].join('→');
  const ancestors = JSON.stringify(history);

  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  <link rel="icon" type="image/ico" href="/favicon.ico">
  <link rel="manifest" href="/site.webmanifest">
  <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#f3a35d">

  <meta name="msapplication-TileColor" content="#ffdd88">

  <meta name="theme-color" content="#ffdd88">
  <meta name="theme-color" content="#eeaa66">

  <meta property="og:type" content="article">
  <meta property="og:site_name" content="しりとらせ">
  <meta property="og:description" content="絵しりとりをツイートしてみんなで遊ぼう！">

  <meta name="twitter:card" content="summary_large_image">

  <meta property="og:url" content="https://siritorase.net/${id}"}>
  <meta property="og:image" content="https://siritorase.net/${id}/ogp.png">
  <meta property="og:title" content="${title}">

  <script>window.siritorase.ancestors=${ancestors};</script>

  <title>しりとらせ</title>
</head>
<body>
<div id="root"></div>
<script type="module" src="/src/main.tsx"></script>
</body>
</html>`;
}
