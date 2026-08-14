import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Network } from 'vis-network';
import type { IdType } from 'vis-network';
import type { PictureNode } from '../Drawing/types';
import { options } from './utils/options';
import getNetworkData from './utils/getNetworkData';
import getAncestorsSelection from './utils/getAncestorsSelection';
import styles from './index.module.css';

type Props = {
  pictures: PictureNode[];
  targetId?: string;
};

export default function Graph(props: Props) {
  const { pictures, targetId } = props;
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      const data = getNetworkData(pictures);
      const network = new Network(ref.current, data, options);

      network.on('click', ({ nodes }: { nodes: IdType[] }) => {
        const [id] = nodes;
        if (id) {
          const selection = getAncestorsSelection(id, data.edges.get());
          network.setSelection(selection, { highlightEdges: false });
        }
      });
      network.on('doubleClick', ({ nodes }: { nodes: IdType[] }) => {
        const [id] = nodes;
        if (id) {
          navigate(`/reply/${id}`);
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
