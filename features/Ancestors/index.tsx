import type { RefCallback } from 'react';
import type { PictureType } from 'features/Drawing/types';
import styles from './index.module.css';

type Props = {
  ancestors: PictureType[];
  imageRef: RefCallback<HTMLImageElement>;
};

export default function Ancestors(props: Props) {
  const { ancestors, imageRef } = props;

  return (
    <ul
      className={styles.ancestors}
      ref={(list) => {
        list?.scrollTo(list?.scrollWidth - list?.offsetWidth, 0);
      }}
    >
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
