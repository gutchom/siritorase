import { useEffect, useState } from 'react';
import type { PostNode } from '@/features/Drawing/types';
import type { Stroke } from '@/features/Drawing/atoms';
import Graph from '@/features/Graph';
import fetchPosts from '@/functions/fetchPosts';
import { pic } from '@/functions/src';
import intent from '@/functions/intent';
import styles from './Result.module.css';

type Props = {
  id: string;
  title: string;
  strokes: Stroke[];
};

/*
 * TODO: メイキング動画の生成とダウンロードを実装する
 */
export default function Result(props: Props) {
  const { id, title } = props;
  const [posts, setPosts] = useState<PostNode[]>([]);
  const tweet = intent(
    `絵しりとりを描いたよ〜〜🎨✨\nリンクからしりとりの続きに参加しよう🧑‍🎨🧑‍🎨🧑‍🎨`,
    `${location.origin}/${id}`,
    ['しりとらせ', '絵しりとり'],
  );

  useEffect(() => {
    fetchPosts().then(setPosts);
  });

  return (
    <main>
      <section>
        <div className={styles.vis}>
          <Graph posts={posts} target={id} />
        </div>
        <a className={styles.intent} href={tweet}>
          &#x1D54F;に投稿する
        </a>
        <a
          className={styles.download}
          download={`${title}.png`}
          href={pic(id, title)}
        >
          画像をダウンロードする
        </a>
      </section>
    </main>
  );
}
