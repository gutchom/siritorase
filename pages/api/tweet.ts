import { TwitterApi } from 'twitter-api-v2';
import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from 'lib/firebase/server';

type AccessKey = {
  token: string;
  secret: string;
};

type Body = {
  uid: string;
  tweet: string;
  tweetId: string;
};

type Res = {
  id: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Res>,
) {
  const { uid, tweet, tweetId } = req.body as Body;
  const { token, secret } = await db
    .collection('users')
    .doc(uid)
    .get()
    .then((s) => s.data() as AccessKey);

  const client = new TwitterApi({
    appKey: process.env.NEXT_PUBLIC_TWITTER_CONSUMER_KEY as string,
    appSecret: process.env.NEXT_PUBLIC_TWITTER_CONSUMER_SECRET as string,
    accessToken: token,
    accessSecret: secret,
  });
  const { id_str: id } = await client.v1.tweet(tweet, {
    in_reply_to_status_id: tweetId,
  });

  res.status(200).json({ id });
}
