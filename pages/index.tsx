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

        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9429732150361585"
          crossOrigin="anonymous"
        ></script>
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
          <Result
            id={id}
            title={title}
            picture={URL.createObjectURL(picture)}
            history={''}
          />
        )}
      </main>
    </>
  );
};

export default Home;
