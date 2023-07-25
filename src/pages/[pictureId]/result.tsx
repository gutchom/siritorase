import type { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { doc, updateDoc } from '@firebase/firestore';
import { db } from 'src/lib/browser/firebase';
import getAncestors from 'src/lib/server/getAncestors';
import getPictures from 'src/lib/server/getPictures';
import type { PictureNode, PictureType } from 'src/features/Drawing/types';
import Graph from 'src/features/Graph';
import Tweet from 'src/features/Tweet';
import styles from 'src/styles/result.module.css';

type Props = {
  drew: PictureNode;
  pictures: PictureNode[];
  ancestors: PictureType[];
};

const Result: NextPage<Props> = (props) => {
  const { drew, pictures, ancestors } = props;
  const { src, title, tweetId, userId } = drew;
  const router = useRouter();
  const { pictureId } = router.query;
  const id = typeof pictureId === 'string' ? pictureId : '';
  const history = ancestors
    .slice(-3, -1)
    .map(({ title }) => title)
    .concat('？？？')
    .join('→');

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
            history={history}
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
  const { params } = context;
  if (!params) {
    throw new Error('params is not defined.');
  }
  const { pictureId } = params;
  const ancestors = await getAncestors(pictureId);
  const pictures = await getPictures();
  const drew = pictures.find(({ id }) => id === pictureId);

  if (drew) {
    return { props: JSON.parse(JSON.stringify({ pictures, drew, ancestors })) };
  } else {
    return { notFound: true };
  }
};
