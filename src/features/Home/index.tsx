import { useEffect, useState } from 'react';
import Graph from '@/features/Graph';
import { PostNode } from '@/features/Drawing/types';
import fetchPosts from '@/functions/fetchPosts';
import styles from './index.module.css';

export default function Home() {
  const [posts, setPosts] = useState<PostNode[]>([]);

  useEffect(() => {
    fetchPosts().then(setPosts);
  }, []);

  return (
    <main>
      <h2 className={styles.title}>みんなのしりとり</h2>
      <div className={styles.vis}>
        <Graph posts={posts} />
      </div>
    </main>
  );
}
