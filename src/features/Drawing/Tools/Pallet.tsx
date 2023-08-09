import { useAtom } from 'jotai';
import { FaCheck, FaEraser } from 'react-icons/fa';
import { colors, strokeColorAtom } from '../atoms';
import styles from './Pallet.module.css';

export default function Pallet() {
  const [strokeColor, setStrokeColor] = useAtom(strokeColorAtom);

  return (
    <ul className={styles.container}>
      {colors.map((color) => (
        <li key={color}>
          <label
            className={styles.color}
            style={{
              background:
                color === 'white' && strokeColor === 'white' ? 'gray' : color,
              color:
                color === 'white' && strokeColor !== 'white' ? '#664' : 'white',
              fontSize: color === 'white' ? '14px' : '10px',
            }}
          >
            {color === 'white' && <FaEraser />}
            {color !== 'white' && color === strokeColor && <FaCheck />}
            <input
              className={styles.input}
              type="radio"
              value={color}
              checked={color === strokeColor}
              onChange={(e) => {
                setStrokeColor(e.target.value);
              }}
            />
          </label>
        </li>
      ))}
    </ul>
  );
}
