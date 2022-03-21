import { useRef, useState } from 'react';
import type { AnswerType } from './types';
import { useDrawing } from './hooks/useDrawing';
import { complete } from './utils';
import { Tools } from './Tools';
import styles from './index.module.css';

type Props = {
  parents: AnswerType[];
  images: HTMLImageElement[];
  onComplete(id: string, title: string, picture: Blob): void;
};

export function Drawing(props: Props) {
  const { parents, images, onComplete } = props;
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
      <div className={styles.tools}>
        <Tools />
      </div>
      <button
        className={styles.complete}
        onClick={async () => {
          const [id, picture] = await complete(
            canvasRef,
            title,
            parents,
            images,
          );
          onComplete(id, title, picture);
        }}
      >
        絵を投稿する
      </button>
    </div>
  );
}
