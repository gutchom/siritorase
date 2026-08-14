import { FaRedo, FaUndo } from 'react-icons/fa';
import useStroke from '../hooks/useStroke';
import styles from './UndoRedo.module.css';

export default function UndoRedo() {
  const { undo, redo, canUndo, canRedo } = useStroke();

  return (
    <div className={styles.container}>
      <button className={styles.button} disabled={!canUndo} onClick={undo}>
        <FaUndo />
      </button>
      <button className={styles.button} disabled={!canRedo} onClick={redo}>
        <FaRedo />
      </button>
    </div>
  );
}
