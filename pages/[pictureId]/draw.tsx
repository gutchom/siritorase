import type { GetServerSideProps, NextPage } from 'next';
import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import getAncestors from 'lib/server/getAncestors';
import getMediaURL from 'lib/getMediaURL';
import useMultipleRef from 'lib/useMultipleRef';
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
  const [refs, images] = useMultipleRef<HTMLImageElement>(ancestors.length);
  const { user } = useAuth();
  const [isIntroOpen, setIsIntroOpen] = useState(true);
  const history = ancestors
    .slice(-3, -1)
    .map(({ title }) => title)
    .concat('？？？')
    .join('→');

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
        <Ancestors ref={refs} ancestors={ancestors} />
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
    return { notFound: true };
  }
};
