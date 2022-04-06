import { useRef, useState } from 'react';
import type { PostType } from './types';
import { useDrawing } from './hooks/useDrawing';
import { complete } from './util/complete';
import Tools from './Tools';
import styles from './index.module.css';

type Props = {
  ancestors: PostType[];
  images: HTMLImageElement[];
  onComplete(id: string, title: string, picture: Blob): void;
};

export default function Drawing(props: Props) {
  const { ancestors, images, onComplete } = props;
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
      {/* TODO: 未入力時に絵を投稿できない場合、注意書きを表示する */}
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
          if (canvasRef.current === null) {
            return;
          }
          const [id, picture] = await complete(
            title,
            ancestors,
            canvasRef.current,
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
