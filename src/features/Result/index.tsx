import type { PostNode, PostItem } from '@/features/Drawing/types.ts';
import Graph from '@/features/Graph';
import styles from './index.module.css';

type Props = {
  drew: PostNode;
  pictures: PostNode[];
  ancestors: PostItem[];
};

export default function Result() {
  const { drew, pictures, ancestors } = props;
  const { src, title, tweetId, userId } = drew;
  const id = location.pathname.split('/').at(-1)!;
  const history = ancestors
    .slice(-3, -1)
    .map(({ title }) => title)
    .concat('？？？')
    .join('→');

  return (
    <main>
      <section>
        <div className={styles.vis}>
          <Graph posts={pictures} target={id} />
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
  );
}

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
