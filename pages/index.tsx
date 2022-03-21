import { useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { Drawing } from 'features/Drawing';
import { Result } from 'features/Result';
import styles from 'styles/Home.module.css';

const Home: NextPage = () => {
  const [id, setId] = useState('');
  const [title, setTitle] = useState('');
  const [picture, setPicture] = useState<Blob>();

  const isDrawing =
    id.length === 0 || title.length === 0 || picture === undefined;

  return (
    <>
      <Head>
        <title>しりとらせ</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        {isDrawing ? (
          <Drawing
            parents={[]}
            images={[]}
            onComplete={(id, title, picture) => {
              setId(id);
              setTitle(title);
              setPicture(picture);
            }}
          />
        ) : (
          <Result id={id} title={title} picture={picture} history={[]} />
        )}
      </main>
    </>
  );
};

export default Home;
