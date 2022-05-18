import type { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { db } from 'lib/server/firebase';
import getMediaURL from 'lib/getMediaURL';
import useMultipleRef from 'lib/useMultipleRef';
import Ancestors from 'features/Ancestors';
import Drawing from 'features/Drawing';
import type { PictureDoc, PictureType } from 'features/Drawing/types';

type Props = {
  ogp: string;
  ancestors: PictureType[];
};

const Draw: NextPage<Props> = (props) => {
  const { ogp, ancestors } = props;
  const router = useRouter();
  const { pictureId } = router.query;
  const [refs, images] = useMultipleRef<HTMLImageElement>(ancestors.length);
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
          onComplete={(id) => {
            router.push(`/${id}/result`);
          }}
        />
      </main>
    </>
  );
};

export default Draw;

async function getAncestors(id: string): Promise<Omit<PictureType, 'src'>[]> {
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
