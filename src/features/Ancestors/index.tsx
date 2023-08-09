import type { PostItem } from '@/features/Drawing/types';
import styles from './index.module.css';

type Props = {
  ancestors: PostItem[];
};

export default function Ancestors(props: Props) {
  const { ancestors } = props;

  function secret(index: number, count: number): boolean {
    return index >= ancestors.length - count;
  }

  return (
    <ul
      className={styles.ancestors}
      ref={(list) => {
        list?.scrollTo(list.scrollWidth - list.offsetWidth, 0);
      }}
    >
      {ancestors.map(({ id, title }, index) => (
        <li key={id} className={styles.picture}>
          <label>
            <img
              className={styles.img}
              id={id}
              src={`/${id}/${encodeURIComponent(title)}.png`}
              alt={secret(index, 3) ? '？？？' : title}
            />
            <span className={styles.caption}>
              {secret(index, 3) ? '？？？' : title}
            </span>
          </label>
        </li>
      ))}
    </ul>
  );
}
