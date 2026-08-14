import Pallet from './Pallet';
import UndoRedo from './UndoRedo';
import Brushes from './Brushes';
import styles from './index.module.css';

export default function Tools() {
  return (
    <div className={styles.tools}>
      <div className={styles.pallet}>
        <Pallet />
      </div>
      <div className={styles.buttons}>
        <UndoRedo />
        <Brushes />
      </div>
    </div>
  );
}
