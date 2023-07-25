export default function drawTriangle(
  ctx: CanvasRenderingContext2D,
  direction: 'left' | 'right',
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
) {
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.moveTo(x, y);
  ctx.lineTo(x + height, y + width / 2);
  ctx.lineTo(x, y + width);
  ctx.lineTo(x, y);
  ctx.closePath();
  ctx.fill();
}
