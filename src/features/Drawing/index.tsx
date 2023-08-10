import Draw from './Draw';
import Result from './Result';
import { Stroke } from './atoms.ts';
import { useLocalStorage } from '@/functions/useStorage.ts';

export default function Drawing() {
  const id = window.location.pathname.split('/').at(-1)!;
  const ancestors = window.siritorase.ancestors ?? [];
  const [{ title }] = ancestors;
  const [drew, setDrew] = useLocalStorage<string[]>('drew', []);
  const [strokes, setStrokes] = useLocalStorage<Stroke[]>('strokes', []);

  return drew.includes(id) ? (
    <Result id={id} strokes={strokes} title={title} />
  ) : (
    <Draw
      ancestors={ancestors}
      drew={drew}
      setDrew={setDrew}
      setStrokes={setStrokes}
    />
  );
}
