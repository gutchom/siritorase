import type { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { doc, updateDoc } from '@firebase/firestore';
import { auth, db } from 'lib/browser/firebase';
import getPictures from 'lib/server/getPictures';
import useAuth from 'lib/useAuth';
import type { PictureNode } from 'features/Drawing/types';
import Graph from 'features/Graph';
import styles from 'styles/result.module.css';

type Props = {
  pictures: PictureNode[];
  drew: PictureNode;
};

const Result: NextPage<Props> = (props) => {
  const { pictures, drew } = props;
  const { user, login } = useAuth();
  const router = useRouter();
  const { pictureId } = router.query;
  const id = typeof pictureId === 'string' ? pictureId : '';
  const { src, title, tweetId, userId } = drew;

  return (
    <>
      <Head>
        <title>しりとらせ</title>
      </Head>

      <main>
        <section>
          <div className={styles.vis}>
            <Graph pictures={pictures} targetId={id} />
          </div>
          <button
            className={styles.tweet}
            onClick={async (e) => {
              e.preventDefault();
              if (!user) {
                login();
                return;
              }
              if (id) {
                const url = await tweet(id, user.uid, tweetId, userId);
                router.push(url);
              }
            }}
          >
            ツイートする
          </button>
          <a className={styles.download} href={src} download={`${title}.png`}>
            画像をダウンロードする
          </a>
        </section>
      </main>
    </>
  );
};

export default Result;

async function tweet(
  id: string,
  uid: string,
  parentTweetId?: string,
  parentTweetUser?: string,
): Promise<string> {
  const text = [
    '絵しりとりを描いたよ！リンク先からしりとりの続きに参加しよう',
    `https://siritorase.vercel.app/${id}`,
    '#絵しりとり #しりとり #しりとらせ',
  ].join('\n');
  const mention = `@${parentTweetUser}`;
  const tweet = parentTweetId && parentTweetUser ? mention + text : text;
  const body = JSON.stringify({ uid, tweet, parentTweetId });
  const response = await fetch(new Request('/api/tweet'), {
    method: 'POST',
    body,
  });
  if (response.ok) {
    const { tweetId, userId } = await response.json();
    await updateDoc(doc(db, 'pictures', id), { tweetId, userId });
    return `https://twitter.com/${userId}/status/${tweetId}`;
  } else {
    throw new Error('Failed to tweet.');
  }
}

type Params = {
  pictureId: string;
};

export const getServerSideProps: GetServerSideProps<Props, Params> = async (
  context,
) => {
  const { req, params } = context;
  if (!params) {
    throw new Error('params is not defined.');
  }
  const { pictureId } = params;
  const [hostname] = req.headers.host?.split(':') ?? [];
  const pictures = await getPictures(hostname);
  const drew = pictures.find(({ id }) => id === pictureId);

  if (drew) {
    return { props: JSON.parse(JSON.stringify({ pictures, drew })) };
  } else {
    return { notFound: true };
  }
};
