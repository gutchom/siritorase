import Pallet from 'src/features/Drawing/Tools/Pallet';
import UndoRedo from 'src/features/Drawing/Tools/UndoRedo';
import Brushes from 'src/features/Drawing/Tools/Brushes';
import styles from 'src/features/Drawing/Tools/index.module.css';

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
