import type { RefObject } from 'react';
import { forwardRef, useEffect, useRef } from 'react';
import getMediaURL from 'lib/firebase/getMediaURL';
import type { PostType } from 'features/Drawing/types';
import Picture from './Picture';
import styles from './index.module.css';

type Props = {
  ancestors: PostType[];
  isTitleVisible: boolean;
};

export default forwardRef<RefObject<HTMLImageElement>[], Props>(
  function Ancestors(props, ref) {
    const { ancestors, isTitleVisible } = props;
    const listRef = useRef<HTMLUListElement>(null);

    useEffect(() => {
      listRef.current?.scrollTo(
        listRef.current.scrollWidth - listRef.current.offsetWidth,
        0,
      );
    }, [listRef]);

    return (
      <ul className={styles.ancestors} ref={listRef}>
        {ancestors.map(({ id, title }, index) => (
          <li key={id} className={styles.picture}>
            <Picture
              ref={ref && 'current' in ref ? ref.current?.[index] : null}
              url={getMediaURL(`picture/${id}.png`)}
              title={
                index === ancestors.length - 1 && !isTitleVisible
                  ? '？？？'
                  : title
              }
            />
          </li>
        ))}
      </ul>
    );
  },
);
