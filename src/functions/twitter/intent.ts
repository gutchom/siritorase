export function intent(id: string): string {
  const intent = new URL('https://twitter.com/intent/tweet');
  intent.searchParams.set('hashtags', 'しりとらせ,絵しりとり');
  intent.searchParams.set('url', `${location.origin}/${id}`);
  intent.searchParams.set(
    'text',
    `絵しりとりを描いたよ〜〜🎨✨\nリンクからしりとりの続きに参加しよう🧑‍🎨🧑‍🎨🧑‍🎨`,
  );

  return intent.href;
}
