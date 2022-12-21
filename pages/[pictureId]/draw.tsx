import type { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import type { RefCallback } from 'react';
import { useCallback, useMemo, useState } from 'react';
import getAncestors from 'lib/server/getAncestors';
import getMediaURL from 'lib/getMediaURL';
import useAuth from 'lib/useAuth';
import Ancestors from 'features/Ancestors';
import Drawing from 'features/Drawing';
import Introduction from 'features/Introduction';
import type { PictureType } from 'features/Drawing/types';

type Props = {
  ogp: string;
  ancestors: PictureType[];
};

const Draw: NextPage<Props> = (props) => {
  const { ogp, ancestors } = props;
  const router = useRouter();
  const { pictureId } = router.query;
  const { user } = useAuth();
  const [imgMap, setImgMap] = useState(new Map<number, HTMLImageElement>());
  const [isIntroOpen, setIsIntroOpen] = useState(true);
  const history = ancestors
    .slice(-3, -1)
    .map(({ title }) => title)
    .concat('？？？')
    .join('→');

  const images = useMemo(
    () =>
      Array.from(imgMap)
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
        .map(([, img]) => img),
    [imgMap],
  );

  const imageRef: RefCallback<HTMLImageElement> = useCallback(
    (img) => {
      if (img === null) return;
      const index = ancestors.findIndex(({ id }) => id === img?.id);
      setImgMap((map) => new Map(map).set(index, img));
    },
    [ancestors],
  );

  return (
    <>
      <Head>
        <title>しりとらせ</title>
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="しりとらせ" />
        <meta
          property="og:description"
          content="絵しりとりをツイートしてみんなで遊ぼう！"
        />
        <meta property="og:title" content={history} />
        <meta
          property="og:url"
          content={`https://siritorase.net/${pictureId}`}
        />
        <meta property="og:image" content={ogp} />

        <meta name="twitter:site" content="@gutchom" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <main>
        <Ancestors ancestors={ancestors} imageRef={imageRef} />
        <Drawing
          ancestors={ancestors}
          images={images}
          onComplete={async (id) => {
            await router.push(`/${id}/result`);
          }}
        />
      </main>

      <Introduction
        visible={isIntroOpen && !user}
        onClose={() => setIsIntroOpen(false)}
      />
    </>
  );
};

export default Draw;

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
  const hostname = req.headers.host?.split(':').at(0) ?? '';

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
    return { notFound: true };
  }
};
