import { createRef, useEffect, useRef, useState } from 'react';
import type { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { getMediaURL } from 'lib/firebase/utils';
import { db } from 'lib/firebase/server';
import { Parents } from 'features/Parents';
import { Result } from 'features/Result';
import { Drawing } from 'features/Drawing';
import type {
  AnswerType,
  PictureDoc,
  PictureType,
} from 'features/Drawing/types';
import styles from 'styles/Home.module.css';

type Props = {
  parents: AnswerType[];
  pictures: PictureType[];
};

const Answer: NextPage<Props> = (props) => {
  const { parents, pictures } = props;

  const router = useRouter();
  const { pictureId } = router.query;

  const ref = useRef(
    Array(pictures.length)
      .fill(null)
      .map(() => createRef<HTMLImageElement>()),
  );
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  useEffect(() => {
    setImages(
      ref.current
        .map((ref) => ref.current)
        .filter((image) => image !== null) as HTMLImageElement[],
    );
  }, [ref]);

  const [id, setId] = useState('');
  const [title, setTitle] = useState('');
  const [picture, setPicture] = useState<Blob>();

  const isDrawing =
    id.length === 0 || title.length === 0 || picture === undefined;
  const history = parents
    .slice(-5)
    .map(({ title }, index) => (index === 4 ? '？？？' : title))
    .join('→');

  return (
    <>
      <Head>
        <title>しりとらせ</title>
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:title" content="絵しりとりの続きを描こう！" />
        <meta property="og:type" content="article" />
        <meta
          property="og:url"
          content={`https://siritorase.net/${pictureId}`}
        />
        <meta
          property="og:image"
          content={getMediaURL(`ogp/${pictureId}.png`)}
        />

        <meta property="og:site_name" content="しりとらせ" />
        <meta property="og:description" content={history} />

        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <main className={styles.main}>
        <Parents ref={ref} pictures={pictures} isTitleVisible={!isDrawing} />

        {isDrawing ? (
          <Drawing
            parents={parents}
            images={images}
            onComplete={(id, title, picture) => {
              setId(id);
              setTitle(title);
              setPicture(picture);
            }}
          />
        ) : (
          <Result id={id} title={title} picture={picture} history={history} />
        )}
      </main>
    </>
  );
};

export default Answer;

async function getParents(id: string): Promise<AnswerType[]> {
  const docRef = db.collection('pictures').doc(id);
  const snapshot = await docRef.get();
  const { parents, title } = snapshot.data() as PictureDoc;

  return [...parents, { id, title }];
}

type Params = {
  pictureId: string;
};

export const getServerSideProps: GetServerSideProps<Props, Params> = async (
  context,
) => {
  if (!context.params) {
    throw new Error('context.params is not defined.');
  }
  const { pictureId } = context.params;
  const parents = await getParents(pictureId);
  const pictures = parents.map(({ id, title }) => ({
    url: getMediaURL(`picture/${id}.png`),
    title,
  }));

  return {
    props: { parents, pictures },
  };
};
