import type { RefObject } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import useStroke from './useStroke';
import type { StrokeColor, StrokeType, StrokeWidth } from '../atoms';
import { strokeColorState, strokeTypeState, strokeWidthState } from '../atoms';
import type { Point } from '../types';

export default function useDrawing(ref: RefObject<HTMLCanvasElement>): {
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

  const beginStroke: (
    x: number,
    y: number,
    strokeWidth?: StrokeWidth,
    strokeColor?: StrokeColor,
    strokeType?: StrokeType,
  ) => void = useCallback(
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
      context.lineJoin = 'round';
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
