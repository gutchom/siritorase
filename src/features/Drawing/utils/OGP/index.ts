import type { PictureType } from 'src/features/Drawing/types';
import drawTriangle from 'src/features/Drawing/utils/OGP/drawTriangle';
import drawPictureWithCaption from 'src/features/Drawing/utils/OGP/drawPictureWithCaption';

export default async function generateOGP(
  title: string,
  latest: HTMLCanvasElement,
  ancestors: PictureType[],
  ancestorImages: HTMLImageElement[],
): Promise<HTMLCanvasElement> {
  const [ogp, ctx] = init(1200, 630);
  const background = await fetchBitmap('/img/ogp_background.png');
  ctx.drawImage(background, 0, 0);

  drawPictureWithCaption(
    ctx,
    latest,
    title,
    480,
    ctx.canvas.width / 2 + 60,
    60,
  );

  const digestCount = 2;
  const digestSize = 240;
  const triangle = 32;
  const digestsY = ctx.canvas.height / 2 - digestSize / 2;
  const digestsMargin =
    (ctx.canvas.width / 2 + 60 - digestSize * digestCount) / (digestCount + 1);
  const triangleMargin = digestsMargin / 2 - triangle / 2;
  ancestors.slice(-digestCount).forEach(({ title }, index) => {
    const digestX = digestsMargin + (digestSize + digestsMargin) * index;
    drawPictureWithCaption(
      ctx,
      ancestorImages.slice(-digestCount)[index],
      title,
      digestSize,
      digestX,
      digestsY,
    );
    drawTriangle(
      ctx,
      'left',
      digestX + digestSize + triangleMargin,
      ctx.canvas.height / 2 - triangle / 2,
      triangle,
      triangle,
      '#f00',
    );
  });
  return ogp;
}

function init(
  width: number,
  height: number,
): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (context === null) {
    throw new Error('canvas context is not available.');
  }

  return [canvas, context];
}

function fetchBitmap(path: string): Promise<ImageBitmap> {
  return fetch(path)
    .then((res) => res.blob())
    .then((blob) => createImageBitmap(blob));
}
