import { forwardRef } from 'react';
import styles from 'features/Parents/Picture.module.css';

type Props = {
  url: string;
  title: string;
};

export const Picture = forwardRef<HTMLImageElement, Props>(function Picture(
  props,
  ref,
) {
  const { url, title } = props;

  return (
    <figure>
      <img
        className={styles.img}
        ref={ref}
        src={url}
        alt={title}
        crossOrigin="anonymous"
      />
      <figcaption className={styles.caption}>{title}</figcaption>
    </figure>
  );
});
