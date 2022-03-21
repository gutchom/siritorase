import type { RefObject } from 'react';
import { forwardRef, useEffect, useRef } from 'react';
import { Picture } from './Picture';
import styles from './index.module.css';
import type { PictureType } from 'features/Drawing/types';

type Props = {
  pictures: PictureType[];
  isTitleVisible: boolean;
};

export const Parents = forwardRef<RefObject<HTMLImageElement>[], Props>(
  function Parents(props, ref) {
    const { pictures, isTitleVisible } = props;
    const listRef = useRef<HTMLUListElement>(null);

    useEffect(() => {
      if (listRef.current === null) {
        return;
      }
      const el = listRef.current;
      const offsetWidth = el.offsetWidth;
      const scrollWidth = el.scrollWidth;
      el.scrollTo(scrollWidth - offsetWidth, 0);
    }, [listRef]);

    return (
      <ul className={styles.parents} ref={listRef}>
        {pictures.map(({ url, title }, index) => (
          <li key={url} className={styles.picture}>
            <Picture
              ref={ref && 'current' in ref ? ref.current?.[index] : null}
              url={url}
              title={isTitleVisible ? title : '？？？'}
            />
          </li>
        ))}
      </ul>
    );
  },
);
