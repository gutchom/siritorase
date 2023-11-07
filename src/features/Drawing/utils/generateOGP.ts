import type { PostItem } from '../types';
import createCanvasContext from './createCanvasContext';
import drawTriangle from './drawTriangle';
import drawPictureWithCaption from './drawPictureWithCaption';
import fetchBitmap from './fetchBitmap';

export default async function generateOGP(
  picture: HTMLCanvasElement,
  history: PostItem[],
): Promise<HTMLCanvasElement> {
  const ctx = createCanvasContext(1200, 630);

  fetchBitmap('/img/ogp_background.png').then((bitmap) => {
    ctx.drawImage(bitmap, 0, 0, 1200, 630);
  });

  drawPictureWithCaption(
    ctx,
    picture,
    history.pop()!.title,
    480,
    ctx.canvas.width / 2 + 60,
    60,
  );

  const digestCount = 2;
  const digestSize = 240;
  const triangleSize = 32;
  const triangleY = ctx.canvas.height / 2 - triangleSize / 2;
  const digestsY = ctx.canvas.height / 2 - digestSize / 2;
  const digestsMargin =
    (ctx.canvas.width / 2 + 60 - digestSize * digestCount) / (digestCount + 1);
  const triangleMargin = digestsMargin / 2 - triangleSize / 2;

  history.slice(-digestCount).forEach(({ id, title }, index) => {
    const digestX = digestsMargin + (digestSize + digestsMargin) * index;
    const triangleX = digestX - triangleMargin - triangleSize;
    drawTriangle(ctx, triangleX, triangleY, triangleSize, triangleSize, '#f00');
    fetchBitmap(`/${id}/${encodeURIComponent(title)}.png`).then((digest) => {
      drawPictureWithCaption(ctx, digest, title, digestSize, digestX, digestsY);
    });
  });

  return ctx.canvas;
}
