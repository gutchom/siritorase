import Draw from './Draw';
import Result from './Result';
import { Stroke } from './atoms';
import { useLocalStorage } from '@/functions/useStorage';

export default function Drawing() {
  const id = window.location.pathname.split('/').at(-1)!;
  const ancestors = window.siritorase.ancestors ?? [];
  const [{ title }] = ancestors.length > 0 ? ancestors : [{ title: '' }];
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
