import { FaRedo, FaUndo } from 'react-icons/fa';
import { useDrawingContext } from '../DrawingContext';
import styles from './UndoRedo.module.css';

export default function UndoRedo() {
	const { state, dispatch } = useDrawingContext();
	const canUndo = state.strokes.length > 0;
	const canRedo = state.canceledStrokes.length > 0;

	return (
		<div className={styles.container}>
			<button
				className={styles.button}
				disabled={!canUndo}
				onClick={() => dispatch({ type: 'UNDO' })}
			>
				<FaUndo />
			</button>
			<button
				className={styles.button}
				disabled={!canRedo}
				onClick={() => dispatch({ type: 'REDO' })}
			>
				<FaRedo />
			</button>
		</div>
	);
}
