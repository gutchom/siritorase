import { useEffect, useRef, useState } from 'react';
import { useFetcher } from 'react-router';
import type { PictureType } from './types';
import { DrawingProvider } from './DrawingContext';
import useDrawing from './hooks/useDrawing';
import buildPostFormData from './utils/post';
import Tools from './Tools';
import styles from './index.module.css';

type Props = {
  ancestors: PictureType[];
  images: HTMLImageElement[];
  onComplete(id: string): void;
};

export default function Drawing(props: Props) {
  return (
    <DrawingProvider>
      <DrawingCanvas {...props} />
    </DrawingProvider>
  );
}

function DrawingCanvas(props: Props) {
  const { ancestors, images, onComplete } = props;
  const parentId = ancestors.slice(-1)[0]?.id ?? null;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { start, draw, end } = useDrawing(canvasRef);
  const [title, setTitle] = useState('');
  const [shouldWarn, setShouldWarn] = useState(false);
  const fetcher = useFetcher<{ id: string }>();
  const isPosting = fetcher.state !== 'idle';

  useEffect(() => {
    if (fetcher.data?.id) {
      onComplete(fetcher.data.id);
    }
  }, [fetcher.data, onComplete]);

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
        onPointerUp={end}
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
      <small className={styles.caution} style={{ display: shouldWarn ? 'block' : 'none' }}>
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
          const formData = await buildPostFormData(
            title,
            parentId,
            canvasRef.current,
            ancestors,
            images,
          );
          fetcher.submit(formData, { method: 'post', encType: 'multipart/form-data' });
        }}
      >
        {isPosting ? '投稿中' : '絵を投稿する'}
      </button>
    </div>
  );
}
