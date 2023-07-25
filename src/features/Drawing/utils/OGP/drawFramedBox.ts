import drawRoundSquare from 'src/features/Drawing/utils/OGP/drawRoundSquare';

export default function drawFramedBox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  frameWidth: number,
  frameColor: string,
) {
  drawRoundSquare(
    ctx,
    x - frameWidth,
    y - frameWidth,
    w + frameWidth * 2,
    h + frameWidth * 2,
    (frameWidth * 3) / 2,
    frameColor,
  );
  ctx.fillStyle = '#fff';
  ctx.fillRect(x, y, w, h);
}
