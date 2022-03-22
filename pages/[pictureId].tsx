import type { RefObject } from 'react';
import { createRef, useEffect, useRef, useState } from 'react';
import type { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { db } from 'lib/firebase/server';
import { getMediaURL } from 'lib/firebase/utils';
import { Ancestors } from 'features/Ancestors';
import { Result } from 'features/Result';
import { Drawing } from 'features/Drawing';
import type { PictureDoc, PostType } from 'features/Drawing/types';

type Props = {
  ancestors: PostType[];
};

const Post: NextPage<Props> = (props) => {
  const { ancestors } = props;

  const router = useRouter();
  const { pictureId } = router.query;

  const ref = useRef<RefObject<HTMLImageElement>[]>(
    Array(ancestors.length)
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
  const history = ancestors
    .slice(-4)
    .map(({ title }) => title)
    .concat('？？？')
    .join('→');

  return (
    <>
      <Head>
        <title>しりとらせ</title>
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:title" content="みんなでお絵描きしりとりしよう！" />
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

      <main>
        <Ancestors
          ref={ref}
          ancestors={ancestors}
          isTitleVisible={!isDrawing}
        />

        {isDrawing ? (
          <Drawing
            ancestors={ancestors}
            images={images}
            onComplete={(id, title, picture) => {
              setId(id);
              setTitle(title);
              setPicture(picture);
            }}
          />
        ) : (
          <Result
            id={id}
            title={title}
            picture={URL.createObjectURL(picture)}
            history={history}
          />
        )}
      </main>
    </>
  );
};

export default Post;

export async function getAncestors(id: string): Promise<PostType[]> {
  const docRef = db.collection('pictures').doc(id);
  const snapshot = await docRef.get();
  const { title, ancestors, created } = snapshot.data() as PictureDoc;

  return [...ancestors, { id, title, created }];
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

  return {
    props: { ancestors: await getAncestors(pictureId) },
  };
};
