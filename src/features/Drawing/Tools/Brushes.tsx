import { useAtom } from 'jotai';
import { FaBrush, FaPaintBrush, FaPenNib } from 'react-icons/fa';
import { strokeWidthAtom, widths } from '../atoms';
import styles from './Brushes.module.css';

const icons = [
  <FaPenNib key={1} />,
  <FaPaintBrush key={2} />,
  <FaBrush key={3} style={{ transform: 'rotate(225deg)' }} />,
];

export default function Brushes() {
  const [strokeWidth, setStrokeWidth] = useAtom(strokeWidthAtom);

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
                setStrokeWidth(+e.target.value);
              }}
            />
          </label>
        </li>
      ))}
    </ul>
  );
}
