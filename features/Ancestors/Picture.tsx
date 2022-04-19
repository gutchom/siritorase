import { forwardRef } from 'react';
import styles from 'features/Ancestors/Picture.module.css';

type Props = {
  src: string;
  title: string;
};

export default forwardRef<HTMLImageElement, Props>(function Picture(
  props,
  ref,
) {
  const { src, title } = props;

  return (
    <figure>
      <img
        className={styles.img}
        ref={ref}
        src={src}
        alt={title}
        crossOrigin="anonymous"
      />
      <figcaption className={styles.caption}>{title}</figcaption>
    </figure>
  );
});
