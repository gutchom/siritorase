export default function intent(
  text: string,
  url?: string,
  hashtags?: string[],
): string {
  const intent = new URL('https://twitter.com/intent/tweet');
  intent.searchParams.set('text', text);
  if (url) intent.searchParams.set('url', url);
  if (hashtags?.length) intent.searchParams.set('hashtags', hashtags.join(','));

  return intent.href;
}
