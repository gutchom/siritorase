import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import type { Edge, IdType } from 'vis-network';
import { Network } from 'vis-network';
import type { PictureNode } from 'features/Drawing/types';
import { options } from './utils/options';
import getNetworkData from './utils/getNetworkData';
import trace from './utils/trace';
import styles from './index.module.css';

type EventParam = {
  nodes: number[];
};

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

      network.on('doubleClick', (param: EventParam) => {
        const [, id] = param.nodes;
        router.push(`/${id}/draw`);
      });

      network.on('click', (param: EventParam) => {
        const [id] = param.nodes;
        network.setSelection(selectionToRoot(id, data.edges.get()), {
          highlightEdges: false,
        });
      });

      if (targetId) {
        const selection = selectionToRoot(targetId, data.edges.get());
        network.once('beforeDrawing', () => {
          network.focus(targetId, { scale: 4 });
          network.setSelection(selection, { highlightEdges: false });
        });
        network.once('afterDrawing', () => {
          network.fit({
            nodes: selection.nodes,
            maxZoomLevel: 0.75,
            animation: {
              duration: 3000,
              easingFunction: 'easeInOutCubic',
            },
          });
        });
      }
    }
  }, [ref]);

  return <div className={styles.vis} ref={ref} />;
}

function selectionToRoot(id: IdType, allEdge: Edge[]) {
  const track = trace(allEdge, id);
  const edges = track.map((edge) => edge.id).filter((id): id is IdType => !!id);
  const nodes = track
    .flatMap(({ from, to }) => [from, to])
    .filter((id): id is IdType => !!id)
    .reduce<IdType[]>(
      (list, id) => (list.includes(id) ? list : [...list, id]),
      [],
    );

  return { edges, nodes };
}
