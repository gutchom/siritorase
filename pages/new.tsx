import type { NextPage } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import Result from 'features/Result';
import Drawing from 'features/Drawing';

const Post: NextPage = () => {
  const [id, setId] = useState('');
  const [title, setTitle] = useState('');
  const [picture, setPicture] = useState<Blob>();

  const isDrawing =
    id.length === 0 || title.length === 0 || picture === undefined;

  return (
    <>
      <Head>
        <title>しりとらせ</title>
      </Head>

      <main>
        {isDrawing ? (
          <Drawing
            ancestors={[]}
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

export default Post;
