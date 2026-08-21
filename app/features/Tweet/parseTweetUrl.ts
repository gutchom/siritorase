export type ParsedTweetUrl = {
  tweetId: string;
  screenName: string;
};

export default function parseTweetUrl(input: string): ParsedTweetUrl | null {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }

  if (!/^(www\.)?(twitter|x)\.com$/.test(url.hostname)) {
    return null;
  }

  const match = url.pathname.match(/^\/([^/]+)\/status\/(\d+)/);
  if (!match) {
    return null;
  }

  return { screenName: match[1], tweetId: match[2] };
}
