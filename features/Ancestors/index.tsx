import { forwardRef, useEffect, useRef } from 'react';
import type { MultipleRef } from 'lib/useMultipleRef';
import { getRef } from 'lib/useMultipleRef';
import type { PostType } from 'features/Drawing/types';
import Picture from './Picture';
import styles from './index.module.css';

type Props = {
  ancestors: PostType[];
  isTitleVisible: boolean;
};

export default forwardRef<MultipleRef<HTMLImageElement>, Props>(
  function Ancestors(props, refs) {
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
        {ancestors.map(({ id, src, title }, index) => (
          <li key={id} className={styles.picture}>
            <Picture
              ref={getRef(refs, index)}
              src={src}
              title={
                index >= ancestors.length - 3 && !isTitleVisible
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
