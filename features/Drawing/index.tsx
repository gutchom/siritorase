import { useRef, useState } from 'react';
import { useRecoilState } from 'recoil';
import {
  FaBrush,
  FaCheck,
  FaEraser,
  FaPaintBrush,
  FaPenNib,
  FaRedo,
  FaUndo,
} from 'react-icons/fa';
import { useDrawing, useStroke } from './hooks';
import type { StrokeColor, StrokeWidth } from './atoms';
import { colors, strokeColorsState, strokeWidthState, widths } from './atoms';
import styles from './styles.module.css';

export function Pallet() {
  const { undo, redo } = useStroke();
  const [strokeColor, setStrokeColor] = useRecoilState(strokeColorsState);
  const [strokeWidth, setStrokeWidth] = useRecoilState(strokeWidthState);

  return (
    <div className={styles.tools}>
      <ul className={styles.pallet}>
        {colors.map((color) => (
          <li key={color}>
            <label
              className={styles.color}
              style={{
                background:
                  color === 'white' && strokeColor === 'white' ? 'gray' : color,
                color:
                  color === 'white' && strokeColor !== 'white'
                    ? '#664'
                    : 'white',
                fontSize: color === 'white' ? '14px' : '10px',
              }}
            >
              {color === 'white' && <FaEraser />}
              {color !== 'white' && color === strokeColor && <FaCheck />}
              <input
                style={{ display: 'none' }}
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
      <div className={styles.buttons}>
        <div className={styles.history}>
          <button className={styles['history-button']} onClick={undo}>
            <FaUndo />
          </button>
          <button className={styles['history-button']} onClick={redo}>
            <FaRedo />
          </button>
        </div>
        <ul className={styles.brushes}>
          {widths.map((width) => (
            <li key={width}>
              <label
                className={styles.brush}
                style={{
                  color: width === strokeWidth ? 'white' : '#664',
                  background: width === strokeWidth ? 'gray' : 'white',
                }}
              >
                {width === 8 && <FaPenNib />}
                {width === 24 && <FaPaintBrush />}
                {width === 48 && (
                  <FaBrush style={{ transform: 'rotate(225deg)' }} />
                )}
                <input
                  style={{ display: 'none' }}
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
      </div>
    </div>
  );
}

export default function Drawing() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { start, draw, end } = useDrawing(canvasRef);
  const [title, setTitle] = useState('');

  return (
    <div className={styles.container}>
      <canvas
        className={styles.canvas}
        width={960}
        height={960}
        ref={canvasRef}
        onPointerDown={(e) => {
          start(e.nativeEvent.offsetX * 3, e.nativeEvent.offsetY * 3);
        }}
        onPointerMove={(e) => {
          draw(e.nativeEvent.offsetX * 3, e.nativeEvent.offsetY * 3);
        }}
        onPointerUp={() => {
          end();
        }}
      />
      <input
        className={styles.title}
        type="text"
        placeholder="なに描いた？"
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
        }}
      />
      <Pallet />
    </div>
  );
}
