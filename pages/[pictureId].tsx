import type { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { db } from 'lib/firebase/server';
import getMediaURL from 'lib/getMediaURL';
import useMultipleRef from 'lib/useMultipleRef';
import Ancestors from 'features/Ancestors';
import Result from 'features/Result';
import Drawing from 'features/Drawing';
import type { PictureDoc, PostType } from 'features/Drawing/types';

type Props = {
  ogp: string;
  ancestors: PostType[];
};

const Post: NextPage<Props> = (props) => {
  const { ogp, ancestors } = props;

  const router = useRouter();
  const { pictureId } = router.query;

  const [refs, images] = useMultipleRef<HTMLImageElement>(ancestors.length);

  const [id, setId] = useState('');
  const [title, setTitle] = useState('');
  const [picture, setPicture] = useState<Blob>();

  const isDrawing =
    id.length === 0 || title.length === 0 || picture === undefined;
  const history = ancestors
    .slice(-3, -1)
    .map(({ title }) => title)
    .concat('？？？')
    .join('→');

  return (
    <>
      <Head>
        <title>しりとらせ</title>
        <meta property="og:title" content={history} />
        <meta property="og:type" content="article" />
        <meta
          property="og:url"
          content={`https://siritorase.net/${pictureId}`}
        />
        <meta property="og:image" content={ogp} />

        <meta property="og:site_name" content="しりとらせ" />
        <meta property="og:description" content={history} />

        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <main>
        <Ancestors
          ref={refs}
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

async function getAncestors(id: string): Promise<Omit<PostType, 'src'>[]> {
  const snapshot = await db.collection('pictures').doc(id).get();
  if (!snapshot.exists) {
    throw new RangeError('"pictures" does not have an id.');
  }
  const { title, ancestors, created } = snapshot.data() as PictureDoc;

  return JSON.parse(
    JSON.stringify([...ancestors, { id, title, created: created.toDate() }]),
  );
}

type Params = {
  pictureId: string;
};

export const getServerSideProps: GetServerSideProps<Props, Params> = async (
  context,
) => {
  const { req, params } = context;
  const { pictureId } = params!;
  const [hostname] = req.headers.host?.split(':') ?? [];

  try {
    const ancestors = (await getAncestors(pictureId)).map((ancestor) => ({
      ...ancestor,
      src: getMediaURL(`picture/${ancestor.id}.png`, hostname),
    }));

    return {
      props: {
        ogp: getMediaURL(`ogp/${pictureId}.png`, hostname),
        ancestors,
      },
    };
  } catch {
    return {
      redirect: {
        statusCode: 302,
        destination: '/',
      },
    };
  }
};
