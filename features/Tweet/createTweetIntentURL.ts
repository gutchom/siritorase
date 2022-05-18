export default function createTweetIntentURL(
  history: string,
  pictureId: string,
  parentTweetId?: string,
  parentTweetUser?: string,
): string {
  const url = new URL('https://twitter.com/intent/tweet');
  url.searchParams.set(
    'text',
    `${history}\n絵しりとりを描いたよ！リンクからしりとりの続きに参加しよう\n`,
  );
  url.searchParams.set('url', `https://siritorase.vercel.app/${pictureId}`);
  url.searchParams.set('hashtags', 'しりとり,絵しりとり');
  parentTweetUser && url.searchParams.set('via', parentTweetUser);
  parentTweetId && url.searchParams.set('in_reply_to', parentTweetId);

  return url.href;
}
