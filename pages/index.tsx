import type { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import getPictures from 'lib/server/getPictures';
import type { PictureNode } from 'features/Drawing/types';
import Graph from 'features/Graph';
import styles from 'styles/home.module.css';

type Props = {
  pictures: PictureNode[];
};

const Home: NextPage<Props> = (props) => {
  const { pictures } = props;

  return (
    <>
      <Head>
        <title>しりとらせ</title>
      </Head>

      <main>
        <div className={styles.vis}>
          <Graph pictures={pictures} />
        </div>
        <h2 className={styles.title}>みんなのしりとり</h2>
      </main>
    </>
  );
};

export default Home;

export const getServerSideProps: GetServerSideProps<Props> = async (
  context,
) => {
  const { req } = context;
  if (!req.headers.host) {
    throw new Error('host is undefined.');
  }
  const pictures = await getPictures();

  return { props: JSON.parse(JSON.stringify({ pictures })) };
};
