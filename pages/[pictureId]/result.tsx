import type { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { doc, updateDoc } from '@firebase/firestore';
import { db } from 'lib/browser/firebase';
import getPictures from 'lib/server/getPictures';
import type { PictureNode } from 'features/Drawing/types';
import Graph from 'features/Graph';
import Tweet from 'features/Tweet';
import styles from 'styles/result.module.css';

type Props = {
  pictures: PictureNode[];
  drew: PictureNode;
};

const Result: NextPage<Props> = (props) => {
  const { pictures, drew } = props;
  const { src, title, tweetId, userId } = drew;
  const router = useRouter();
  const { pictureId } = router.query;
  const id = typeof pictureId === 'string' ? pictureId : '';

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
          <Tweet
            pictureId={id}
            tweetId={tweetId}
            tweetUserId={userId}
            onTweet={async (tweetId, tweetUserId) => {
              await updateDoc(doc(db, 'pictures', id), {
                tweetId,
                tweetUserId,
              });
              await router.push(
                `https://twitter.com/${tweetUserId}/status/${tweetId}`,
              );
            }}
          />
          <a className={styles.download} href={src} download={`${title}.png`}>
            画像をダウンロードする
          </a>
        </section>
      </main>
    </>
  );
};

export default Result;

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
