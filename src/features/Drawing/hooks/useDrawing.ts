import { useEffect, useRef, useState } from 'react';
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
export default function useCanvas(ctx: CanvasRenderingContext2D): {
  start(x: number, y: number): void;
  draw(x: number, y: number): void;
  end(): void;
} {
  const { strokes, setStroke } = useStroke();
  const color = useAtomValue(strokeColorAtom);
  const width = useAtomValue(strokeWidthAtom);
  const stroke = useRef<Point[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (!ctx) return;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }, [ctx]);

  function start(x: number, y: number) {
    setIsDrawing(true);
    begin(ctx, x, y, width, color);
    stroke.current = [{ x, y }];
  }

  function draw(x: number, y: number) {
    if (!isDrawing) return;
    ctx.lineTo(x, y);
    ctx.stroke();
    stroke.current.push({ x, y });
  }

  function end() {
    if (!isDrawing) return;
    setIsDrawing(false);
    setStroke({ color, width, points: stroke.current });
  }

  useEffect(() => {
    if (!ctx) return;
    ctx.fillStyle = '#fff';
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    for (const { points, width, color } of strokes) {
      const [{ x, y }, ...stroke] = points;
      begin(ctx, x, y, width, color);

      for (const { x, y } of stroke) {
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    }
  }, [ctx, strokes]);

  return { start, draw, end };
}

function begin(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  color: string,
) {
  ctx.lineWidth = width;
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y);
  ctx.stroke();
}
