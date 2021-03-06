import type { Stroke } from '../atoms';
import { canceledStrokesState, strokesState } from '../atoms';
import { useRecoilState } from 'recoil';

export default function useStroke(): {
  strokes: Stroke[];
  setStroke(stroke: Stroke): void;
  undo(): void;
  redo(): void;
} {
  const [strokes, setStrokes] = useRecoilState(strokesState);
  const [canceled, setCanceled] = useRecoilState(canceledStrokesState);

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
