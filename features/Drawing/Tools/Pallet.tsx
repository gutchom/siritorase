import { FaCheck, FaEraser } from 'react-icons/fa';
import { useRecoilState } from 'recoil';
import type { StrokeColor } from '../atoms';
import { colors, strokeColorState } from '../atoms';
import styles from './Pallet.module.css';

export function Pallet() {
  const [strokeColor, setStrokeColor] = useRecoilState(strokeColorState);

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
                setStrokeColor(e.target.value as StrokeColor);
              }}
            />
          </label>
        </li>
      ))}
    </ul>
  );
}
