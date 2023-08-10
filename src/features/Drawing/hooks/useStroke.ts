import { useAtom } from 'jotai';
import type { Stroke } from '../atoms';
import { strokesAtom, canceledAtom } from '../atoms';

export default function useStroke(): {
  strokes: Stroke[];
  setStroke(stroke: Stroke): void;
  undo(): void;
  redo(): void;
} {
  const [strokes, setStrokes] = useAtom(strokesAtom);
  const [canceled, setCanceled] = useAtom(canceledAtom);

  function setStroke(stroke: Stroke) {
    setStrokes([...strokes, stroke]);
    if (canceled.length > 0) {
      setCanceled([]);
    }
  }

  function undo() {
    setCanceled([...canceled, ...strokes.slice(-1)]);
    setStrokes(strokes.slice(0, -1));
  }

  function redo() {
    setStrokes([...strokes, ...canceled.slice(-1)]);
    setCanceled(canceled.slice(0, -1));
  }

  return { strokes, setStroke, undo, redo };
}
