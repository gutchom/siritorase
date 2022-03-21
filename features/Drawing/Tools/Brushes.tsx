import { FaBrush, FaPaintBrush, FaPenNib } from 'react-icons/fa';
import { useRecoilState } from 'recoil';
import type { StrokeWidth } from '../atoms';
import { strokeWidthState, widths } from '../atoms';
import styles from './Brushes.module.css';

const icons = [
  <FaPenNib key={1} />,
  <FaPaintBrush key={2} />,
  <FaBrush key={3} style={{ transform: 'rotate(225deg)' }} />,
];

export function Brushes() {
  const [strokeWidth, setStrokeWidth] = useRecoilState(strokeWidthState);

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
                setStrokeWidth(+e.target.value as StrokeWidth);
              }}
            />
          </label>
        </li>
      ))}
    </ul>
  );
}
