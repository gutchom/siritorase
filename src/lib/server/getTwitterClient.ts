import { db } from 'src/lib/server/firebase';
import { TwitterApi } from 'twitter-api-v2';

type Credential = {
  token: string;
  secret: string;
};

export default async function getTwitterClient(uid: string) {
  const snapshot = await db.collection('users').doc(uid).get();
  const credential = snapshot.data() as Credential;

  return new TwitterApi({
    appKey: process.env.TWITTER_CONSUMER_KEY as string,
    appSecret: process.env.TWITTER_CONSUMER_SECRET as string,
    accessToken: credential.token,
    accessSecret: credential.secret,
  });
}
