import drawFramedBox from './drawFramedBox';

export default function drawPictureWithCaption(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  title: string,
  size: number,
  x: number,
  y: number,
) {
  drawFramedBox(ctx, x, y, size, size, size / 80, '#ea6');
  ctx.drawImage(image, x, y, size, size);
  const captionWidth = size / 3;
  const captionHeight = captionWidth / 4;
  const captionX = x + size / 2 - captionWidth / 2;
  const captionY = y + size + captionHeight / 2;

  ctx.fillStyle = '#fff';
  ctx.fillRect(captionX, captionY, captionWidth, captionHeight);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#222';
  ctx.font = `${Math.round(captionHeight * 0.6)}px "Hiragino Sans", "Noto Sans JP", sans-serif`;
  ctx.fillText(title, captionX + 4, captionY + captionHeight / 2, captionWidth - 8);
}
