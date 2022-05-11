import type { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import { db } from 'lib/firebase/server';
import getMediaURL from 'lib/getMediaURL';
import type { PictureDoc, PictureNode } from 'features/Drawing/types';
import VisNetwork from 'features/Graph';
import styles from 'styles/Home.module.css';

type Props = {
  pictures: PictureNode[];
};

const Index: NextPage<Props> = (props) => {
  const { pictures } = props;

  return (
    <>
      <Head>
        <title>しりとらせ</title>
      </Head>

      <main>
        <section className={styles.intro}>
          <p>
            しりとらせは不特定多数の人たちとお絵描きしりとりができるWebサービスです。今すぐ人気のお絵描きしりとりに参加しよう！
          </p>
        </section>

        <section>
          <VisNetwork pictures={pictures} />
        </section>
      </main>
    </>
  );
};

export default Index;

async function getPictures(hostname: string): Promise<PictureNode[]> {
  const snapshot = await db.collection('pictures').get();

  return snapshot.docs.map((doc) => {
    const id = doc.id;
    const src = getMediaURL(`picture/${id}.png`, hostname);
    const { title, ancestors } = doc.data() as PictureDoc;
    const [parent] = ancestors.slice(-1);

    return { id, src, title, parentId: parent?.id ?? '' };
  });
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context,
) => {
  const { req } = context;
  if (!req.headers.host) {
    throw new Error('host is undefined.');
  }
  const [hostname] = req.headers.host.split(':');
  const pictures = await getPictures(hostname);

  return { props: { pictures } };
};
