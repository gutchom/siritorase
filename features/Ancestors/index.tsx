import type { RefCallback } from 'react';
import { forwardRef, useCallback } from 'react';
import type { MultipleRef } from 'lib/useMultipleRef';
import { getRef } from 'lib/useMultipleRef';
import type { PictureType } from 'features/Drawing/types';
import styles from './index.module.css';

type Props = {
  ancestors: PictureType[];
};

export default forwardRef<MultipleRef<HTMLImageElement>, Props>(
  function Ancestors(props, refs) {
    const { ancestors } = props;

    const listRef: RefCallback<HTMLUListElement> = useCallback((list) => {
      list?.scrollTo(list.scrollWidth - list.offsetWidth, 0);
    }, []);

    return (
      <ul className={styles.ancestors} ref={listRef}>
        {ancestors.map(({ id, src, title }, index) => (
          <li key={id} className={styles.picture}>
            <label>
              <img
                className={styles.img}
                ref={getRef(refs, index)}
                src={src}
                alt={index >= ancestors.length - 3 ? '？？？' : title}
                crossOrigin="anonymous"
              />
              <span className={styles.caption}>
                {index >= ancestors.length - 3 ? '？？？' : title}
              </span>
            </label>
          </li>
        ))}
      </ul>
    );
  },
);
