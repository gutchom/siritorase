import type { RefCallback } from 'react';
import { useCallback } from 'react';
import type { PictureType } from 'src/features/Drawing/types';
import styles from 'src/features/Ancestors/index.module.css';

type Props = {
  ancestors: PictureType[];
  imageRef: RefCallback<HTMLImageElement>;
};

export default function Ancestors(props: Props) {
  const { ancestors, imageRef } = props;

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
              ref={imageRef}
              id={id}
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
}
