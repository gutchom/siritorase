import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Drawing from 'features/Drawing';

const Post: NextPage = () => {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>しりとらせ</title>
      </Head>

      <main>
        <Drawing
          ancestors={[]}
          images={[]}
          onComplete={(id) => {
            router.push(`/${id}/result`);
          }}
        />
      </main>
    </>
  );
};

export default Post;
