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
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#222';
  ctx.fillText(title, captionX, captionY, captionWidth);
  console.log('font', ctx.font);
}
