import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';
import { Network } from 'vis-network';
import type { PictureNode } from 'features/Drawing/types';
import { options } from './utils/options';
import getNetworkData from './utils/getNetworkData';
import styles from './index.module.css';

type EventParam = {
  nodes: number[];
};

type Props = {
  pictures: PictureNode[];
};

export default function Graph(props: Props) {
  const { pictures } = props;
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      const data = getNetworkData(pictures);
      const network = new Network(ref.current, data, options);
      network.on('doubleClick', (param: EventParam) => {
        const [id] = param.nodes;
        router.push(`/${id}`);
      });
    }
  }, [ref]);

  return <div className={styles.vis} ref={ref} />;
}
