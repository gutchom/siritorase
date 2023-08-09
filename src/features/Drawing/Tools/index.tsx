import Pallet from '@/features/Drawing/Tools/Pallet';
import UndoRedo from '@/features/Drawing/Tools/UndoRedo';
import Brushes from '@/features/Drawing/Tools/Brushes';
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
