import type { NextApiRequest, NextApiResponse } from 'next';
import getTwitterClient from 'lib/getTwitterClient';

type Body = {
  uid: string;
  text: string;
  parentTweetId: string;
};

type Res = {
  tweetId: string;
  tweetUserId: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Res>,
) {
  const { uid, text, parentTweetId } = JSON.parse(req.body) as Body;

  const twitter = await getTwitterClient(uid);
  const response =
    parentTweetId.length > 0
      ? await twitter.v1.tweet(text, { in_reply_to_status_id: parentTweetId })
      : await twitter.v1.tweet(text);

  const tweetId = response.id_str;
  const tweetUserId = response.user.screen_name;

  res.status(200).json({ tweetId, tweetUserId });
}
