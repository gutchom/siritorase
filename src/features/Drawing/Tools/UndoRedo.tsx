import { FaRedo, FaUndo } from 'react-icons/fa';
import useStroke from '../hooks/useStroke';
import styles from './UndoRedo.module.css';

export default function UndoRedo() {
  const { undo, redo } = useStroke();

  return (
    <div className={styles.container}>
      <button className={styles.button} onClick={undo}>
        <FaUndo />
      </button>
      <button className={styles.button} onClick={redo}>
        <FaRedo />
      </button>
    </div>
  );
}
