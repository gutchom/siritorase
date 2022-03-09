import type { RefObject } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import type { Stroke } from './atoms';
import {
  canceledStrokesState,
  strokeColorState,
  strokeTypeState,
  strokeWidthState,
  strokesState,
} from './atoms';

type Point = { x: number; y: number };

export function useStroke(): {
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

export function useDrawing(ref: RefObject<HTMLCanvasElement>): {
  start(x: number, y: number): void;
  draw(x: number, y: number): void;
  end(): void;
} {
  const { strokes, setStroke } = useStroke();
  const type = useRecoilValue(strokeTypeState);
  const width = useRecoilValue(strokeWidthState);
  const color = useRecoilValue(strokeColorState);
  const [points, setPoints] = useState<Point[]>([]);
  const [context, setContext] = useState<CanvasRenderingContext2D>();
  const [canvasWidth, setCanvasWidth] = useState(0);
  const [canvasHeight, setCanvasHeight] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);

  const beginStroke = useCallback(
    (
      x: number,
      y: number,
      strokeWidth = width,
      strokeColor = color,
      strokeType = type,
    ) => {
      if (!context) {
        return;
      }
      context.lineCap = 'round';
      context.lineWidth = strokeWidth;
      context.strokeStyle = strokeColor;
      switch (strokeType) {
        case 'pen': {
          context.globalAlpha = 1;
          context.globalCompositeOperation = 'source-over';
          break;
        }
        case 'eraser': {
          context.globalAlpha = 0.5;
          context.globalCompositeOperation = 'destination-out';
          context.strokeStyle = '#fff';
          break;
        }
      }
      context.beginPath();
      context.moveTo(x, y);
    },
    [context, width, color, type],
  );

  function start(x: number, y: number) {
    setIsDrawing(true);
    beginStroke(x, y);
    setPoints([{ x, y }]);
  }

  function draw(x: number, y: number) {
    if (!isDrawing || !context) {
      return;
    }
    context.lineTo(x, y);
    context.stroke();
    setPoints((points) => [...points, { x, y }]);
  }

  function end() {
    if (!isDrawing || !context) {
      return;
    }
    setIsDrawing(false);
    setStroke({ color, width, type, points });
  }

  useEffect(() => {
    if (!ref.current) {
      return;
    }
    setCanvasWidth(ref.current.width);
    setCanvasHeight(ref.current.height);

    const canvasContext = ref.current.getContext('2d');
    if (canvasContext) {
      setContext(canvasContext);
    }
  }, [ref]);

  useEffect(() => {
    if (!context) {
      return;
    }
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    context.fillStyle = '#fff';
    context.fillRect(0, 0, canvasWidth, canvasHeight);

    for (const stroke of strokes) {
      const [first, ...points] = stroke.points;
      beginStroke(first.x, first.y, stroke.width, stroke.color, stroke.type);

      for (const point of points) {
        context.lineTo(point.x, point.y);
        context.stroke();
      }
    }
  }, [context, canvasWidth, canvasHeight, strokes, beginStroke]);

  return { start, draw, end };
}
