import { FaBrush, FaPaintBrush, FaPenNib } from 'react-icons/fa';
import type { StrokeWidth } from '../DrawingContext';
import { useDrawingContext, widths } from '../DrawingContext';
import styles from './Brushes.module.css';

const icons = [
  <FaPenNib key={1} />,
  <FaPaintBrush key={2} />,
  <FaBrush key={3} style={{ transform: 'rotate(225deg)' }} />,
];

export default function Brushes() {
  const { state, dispatch } = useDrawingContext();
  const strokeWidth = state.width;

  return (
    <ul className={styles.container}>
      {widths.map((width, index) => (
        <li key={width}>
          <label
            className={styles.button}
            style={{
              color: width === strokeWidth ? 'white' : '#664',
              background: width === strokeWidth ? 'gray' : 'white',
            }}
          >
            {icons[index]}
            <input
              className={styles.input}
              type="radio"
              value={width}
              checked={width === strokeWidth}
              onChange={(e) => {
                dispatch({ type: 'SET_WIDTH', width: +e.target.value as StrokeWidth });
              }}
            />
          </label>
        </li>
      ))}
    </ul>
  );
}
