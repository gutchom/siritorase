import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import type { Stroke } from './atoms';
import Tools from './Tools';
import Ancestors from '../Ancestors';
import useStroke from './hooks/useStroke';
import useDrawing from './hooks/useDrawing';
import { useLocalStorage } from '@/functions/useStorage';
import appendRule from '@/functions/css/appendRule';
import ruleSize from '@/functions/css/ruleSize';
import post from './utils/post';
import styles from './index.module.css';

const size = 960;

/*
 * TODO: 削除機能つけろ
 */
export default function Drawing() {
  const ancestors = window.siritorase.ancestors ?? [];
  const ref = useRef<HTMLCanvasElement>(null);
  const { start, draw, end } = useDrawing(ref);
  const { strokes } = useStroke();
  const [, setStrokes] = useLocalStorage<Stroke[]>('strokes', []);
  const [drew, setDrew] = useLocalStorage<string[]>('drew', []);
  const [title, setTitle] = useState('');
  const [shouldWarn, setShouldWarn] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    if (ref.current === null) return;

    const css = new CSSStyleSheet();
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, css];

    const selector = `.${ref.current.className}`;

    ruleSize(css, selector, size / 3);

    const media = appendRule(css, `@media (max-width: 600px)`);
    if (media instanceof CSSMediaRule) ruleSize(media, selector, size / 2);
  }, [ref]);

  return (
    <main className={styles.container}>
      <Ancestors ancestors={ancestors} />
      <canvas
        className={styles.canvas}
        ref={ref}
        width={size}
        height={size}
        onPointerDown={(e) => {
          start(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        }}
        onPointerMove={(e) => {
          draw(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        }}
        onPointerUp={end}
      />
      <input
        className={styles.title}
        placeholder="なに描いた？"
        value={title}
        maxLength={10}
        onChange={(e) => {
          setTitle(e.target.value);
        }}
      />
      <small
        className={styles.warn}
        style={{ visibility: shouldWarn ? 'visible' : 'hidden' }}
      >
        ※タイトルを入力してください
      </small>
      <div className={styles.tools}>
        <Tools />
      </div>
      <button
        className={clsx(styles.post, isPosting && styles.posting)}
        disabled={isPosting}
        onClick={async () => {
          if (ref.current === null) return;
          if (title.length === 0) return setShouldWarn(true);

          setIsPosting(true);
          const id = await post(title, ref.current, ancestors);
          setDrew(drew.length > 0 ? [...drew, id] : [id]);
          setStrokes(strokes);
          setIsPosting(false);
        }}
      >
        {isPosting ? '投稿中' : '絵を投稿する'}
      </button>
    </main>
  );
}
