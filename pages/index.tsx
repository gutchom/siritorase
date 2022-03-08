import type { NextPage } from 'next';
import Head from 'next/head';
import Drawing from '../features/Drawing';
import styles from '../styles/Home.module.css';

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>しりとらせ</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <Drawing />
      </main>
    </>
  );
};

export default Home;
