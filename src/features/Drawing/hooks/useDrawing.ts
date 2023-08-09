import type { RefObject } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAtomValue } from 'jotai';
import useStroke from './useStroke';
import type { Point } from '../atoms';
import { strokeColorAtom, strokeWidthAtom } from '../atoms';

/*
 * ## TODO
 * - 点を打てるようにしたい
 * - ピンチでのズームをスムーズにできたい
 * - マルチタッチに対応したい
 * - ストロークの編集機能があると嬉しいかも
 *  - 線を選択して移動できるようにしたい
 *  - 線を選択して削除できるようにしたい
 */
export default function useCanvas(ref: RefObject<HTMLCanvasElement>): {
  start(x: number, y: number): void;
  draw(x: number, y: number): void;
  end(): void;
} {
  const { strokes, setStroke } = useStroke();
  const color = useAtomValue(strokeColorAtom);
  const width = useAtomValue(strokeWidthAtom);
  const stroke = useRef<Point[]>([]);
  const context = useMemo(() => ref.current?.getContext('2d')!, [ref]);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.globalAlpha = 1;
    context.globalCompositeOperation = 'source-over';
  }, [context]);

  function begin(x: number, y: number, width: number, color: string) {
    context.lineWidth = width;
    context.strokeStyle = color;
    context.beginPath();
    context.moveTo(x, y);
  }

  function start(x: number, y: number) {
    setIsDrawing(true);
    begin(x, y, width, color);
    stroke.current = [{ x, y }];
  }

  function draw(x: number, y: number) {
    if (!isDrawing) return;
    context.lineTo(x, y);
    context.stroke();
    stroke.current.push({ x, y });
  }

  function end() {
    if (!isDrawing) return;
    setIsDrawing(false);
    setStroke({ color, width, points: stroke.current });
  }

  useEffect(() => {
    if (!context) return;
    context.fillStyle = '#fff';
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);

    for (const { points, width, color } of strokes) {
      const [{ x, y }, ...stroke] = points;
      begin(x, y, width, color);

      for (const { x, y } of stroke) {
        context.lineTo(x, y);
        context.stroke();
      }
    }
  }, [context, strokes]);

  return { start, draw, end };
}
