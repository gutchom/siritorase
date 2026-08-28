import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import type { IdType } from 'vis-network';
import type { PictureNode } from '../Drawing/types';
import { options } from './utils/options';
import getAncestorsSelection from './utils/getAncestorsSelection';
import styles from './index.module.css';

type Props = {
  pictures: PictureNode[];
  targetId?: string;
  onReady?: () => void;
};

export default function Graph(props: Props) {
  const { pictures, targetId, onReady } = props;
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) {
      return;
    }
    let cancelled = false;

    // vis-network/vis-dataは重量級(gzip後161KB)なので、
    // /graphに実際に遷移してから初めて読み込む(ルートチャンクを軽く保つため)。
    Promise.all([import('vis-network'), import('./utils/getNetworkData')]).then(
      ([{ Network }, { default: getNetworkData }]) => {
        if (cancelled || !ref.current) {
          return;
        }

        const data = getNetworkData(pictures);
        const network = new Network(ref.current, data, options);
        onReady?.();

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
            // nodesを指定しない(全ノード対象)ことで、投稿した絵にフォーカスした状態から
            // しりとり全体の木構造へズームアウトする演出にする。祖先チェーンの
            // ハイライト(setSelection)はズームアウト後も残るため、木構造全体の中で
            // 今回投稿した絵に至る経路がわかるようになっている。
            network.fit({
              maxZoomLevel: 0.75,
              animation: {
                duration: 5000,
                easingFunction: 'easeInOutCubic',
              },
            });
          });
        }
      },
    );

    return () => {
      cancelled = true;
    };
  }, [ref]);

  return <div className={styles.vis} ref={ref} />;
}
