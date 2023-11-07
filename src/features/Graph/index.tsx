import { useEffect, useRef } from 'react';
import { Network } from 'vis-network';
import type { PostNode } from '@/features/Drawing/types';
import options from './utils/options';
import getNetworkData from './utils/getNetworkData';
import getAncestorsSelection from './utils/getAncestorsSelection';
import styles from './index.module.css';

type Props = {
  posts: PostNode[];
  target?: string;
};

export default function Graph(props: Props) {
  const { posts, target } = props;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      const data = getNetworkData(posts);
      const network = new Network(ref.current, data, options);

      network.on('click', ({ nodes }) => {
        const [id] = nodes;
        if (id) {
          const selection = getAncestorsSelection(id, data.edges.get());
          network.setSelection(selection, { highlightEdges: false });
        }
      });
      network.on('doubleClick', async ({ nodes }) => {
        const [id] = nodes;
        if (id) location.assign(`/${id}`);
      });

      if (target) {
        const selection = getAncestorsSelection(target, data.edges.get());
        network.once('beforeDrawing', () => {
          network.focus(target, { scale: 4 });
          network.setSelection(selection, { highlightEdges: false });
        });
        network.once('afterDrawing', () => {
          network.fit({
            nodes: selection.nodes,
            maxZoomLevel: 0.75,
            animation: {
              duration: 5000,
              easingFunction: 'easeInOutCubic',
            },
          });
        });
      }
    }
  }, [ref]);

  return <div className={styles.vis} ref={ref} />;
}
