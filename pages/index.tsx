import type { NextPage } from 'next';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { db } from 'lib/firebase/server';
import getMediaURL from 'lib/getMediaURL';
import Ancestors from 'features/Ancestors';
import type { PictureDoc, PostType } from 'features/Drawing/types';
import styles from 'styles/Home.module.css';

type Props = {
  arrivals: PostType[][];
};

const Home: NextPage<Props> = (props) => {
  const { arrivals } = props;

  return (
    <>
      <Head>
        <title>しりとらせ</title>
      </Head>

      <main>
        <section className={styles.intro}>
          <p>
            しりとらせは不特定多数の人たちとお絵描きしりとりができるWebサービスです。人気のお絵描きしりとりに今すぐ参加しよう！
          </p>
        </section>

        <section>
          <h2 className={styles.title}>新着お絵描きしりとり一覧</h2>
          <ul>
            {arrivals.map((posts, index) => (
              <li key={index} className={styles.posts}>
                <Ancestors ancestors={posts} isTitleVisible={false} />
                <Link href={`/${posts[posts.length - 1]?.id}`}>
                  <a className={styles.join}>しりとりに参加する</a>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  );
};

export default Home;

async function getArrivals(hostname: string): Promise<PostType[][]> {
  const snapshot = await db.collection('pictures').get();

  return snapshot.docs.map((doc) => {
    const id = doc.id;
    const { title, ancestors, created } = doc.data() as PictureDoc;

    return [...ancestors, { id, title, created: created.toDate() }].map((ancestor) => ({
      ...ancestor,
      src: getMediaURL(`picture/${ancestor.id}.png`, hostname),
    }));
  });
}

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const { req } = context;
  if (!req.headers.host) {
    throw new Error('host is undefined.');
  }
  const [hostname] = req.headers.host.split(':');

  return {
    props: { arrivals: JSON.parse(JSON.stringify(await getArrivals(hostname))) },
  };
};
