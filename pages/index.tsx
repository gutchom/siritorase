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
        <p className={styles.intro}>
          しりとらせはツイッターで絵しりとりができるWebサービスです。
          <br />
          今すぐ絵しりとりの続きを描こう！
        </p>

        <section>
          <div className={styles.vis}>
            <Graph pictures={pictures} />
          </div>
        </section>
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
  const [hostname] = req.headers.host.split(':');
  const pictures = await getPictures(hostname);

  return { props: JSON.parse(JSON.stringify({ pictures })) };
};
