import { useRef, useState } from 'react';
import type { PictureType } from 'src/features/Drawing/types';
import useDrawing from 'src/features/Drawing/hooks/useDrawing';
import post from 'src/features/Drawing/utils/post';
import Tools from 'src/features/Drawing/Tools';
import styles from 'src/features/Drawing/index.module.css';

type Props = {
  ancestors: PictureType[];
  images: HTMLImageElement[];
  onComplete(id: string): void;
};

export default function Drawing(props: Props) {
  const { ancestors, images, onComplete } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { start, draw, end } = useDrawing(canvasRef);
  const [title, setTitle] = useState('');
  const [shouldWarn, setShouldWarn] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

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
      <small
        className={styles.caution}
        style={{ display: shouldWarn ? 'block' : 'none' }}
      >
        ※タイトルを入力してください
      </small>
      <div className={styles.tools}>
        <Tools />
      </div>
      <button
        className={styles.complete}
        disabled={isPosting}
        onClick={async () => {
          if (canvasRef.current === null) return;
          if (title.length === 0) {
            setShouldWarn(true);
            return;
          }
          setIsPosting(true);
          onComplete(await post(title, canvasRef.current, ancestors, images));
          setIsPosting(false);
        }}
      >
        {isPosting ? '投稿中' : '絵を投稿する'}
      </button>
    </div>
  );
}
