import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { Network } from 'vis-network';
import type { PictureNode } from 'src/features/Drawing/types';
import { options } from 'src/features/Graph/utils/options';
import getNetworkData from 'src/features/Graph/utils/getNetworkData';
import getAncestorsSelection from 'src/features/Graph/utils/getAncestorsSelection';
import styles from 'src/features/Graph/index.module.css';

type Props = {
  pictures: PictureNode[];
  targetId?: string;
};

export default function Graph(props: Props) {
  const { pictures, targetId } = props;
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      const data = getNetworkData(pictures);
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
        if (id) {
          await router.push(`/${id}/draw`);
        }
      });

      if (targetId) {
        const selection = getAncestorsSelection(targetId, data.edges.get());
        network.once('beforeDrawing', () => {
          network.focus(targetId, { scale: 4 });
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
