import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import getTwitterClient from 'lib/getTwitterClient';
import prisma from 'lib/prisma';

type Res = {
  url: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Res>,
) {
  const jwt = await getToken({ req });
  if (!jwt) return;

  const { sub: userId } = jwt;
  const account = await prisma.account.findFirst({
    where: { userId, provider: 'twitter' },
  });
  const parent = await prisma

  if (!account) return;
  const { oauth_token, oauth_token_secret } = account;

  if (!oauth_token || !oauth_token_secret) return;
  const twitter = await getTwitterClient(oauth_token, oauth_token_secret);

  const {
    id_str,
    user: { screen_name },
  } =
    parentTweetId.length > 0
      ? await twitter.v1.tweet(text, { in_reply_to_status_id: parentTweetId });
      : await twitter.v1.tweet(text);

  const url = `https://twitter.com/${screen_name}/status/${id_str}`;

  res.status(200).json({ url });
}
