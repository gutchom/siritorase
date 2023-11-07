import type { PostItem } from '@/features/Drawing/types';
import styles from './index.module.css';

type Props = {
  ancestors: PostItem[];
};

// TODO: 画像の読み込みを遅延させる
// TODO: 画像の読み込みに失敗した場合の処理を実装する
// TODO: 画像の読み込み中にローディングアイコンを表示する
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
