import type { RefObject } from 'react';
import { forwardRef, useEffect, useRef } from 'react';
import { getMediaURL } from 'lib/firebase/utils';
import type { PicturePost } from 'features/Drawing/types';
import { Picture } from './Picture';
import styles from './index.module.css';

type Props = {
  parents: PicturePost[];
  isTitleVisible: boolean;
};

export const Parents = forwardRef<RefObject<HTMLImageElement>[], Props>(
  function Parents(props, ref) {
    const { parents, isTitleVisible } = props;
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
        {parents.map(({ id, title }, index) => (
          <li key={id} className={styles.picture}>
            <Picture
              ref={ref && 'current' in ref ? ref.current?.[index] : null}
              url={getMediaURL(id)}
              title={isTitleVisible ? title : '？？？'}
            />
          </li>
        ))}
      </ul>
    );
  },
);
