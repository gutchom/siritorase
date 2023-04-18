import { TwitterApi } from 'twitter-api-v2';

const appKey = process.env.TWITTER_CONSUMER_KEY;
const appSecret = process.env.TWITTER_CONSUMER_SECRET;

export default async function getTwitterClient(
  accessToken: string,
  accessSecret: string,
) {
  return new TwitterApi({ appKey, appSecret, accessToken, accessSecret });
}
