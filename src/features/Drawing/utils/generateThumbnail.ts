import createCanvasContext from '@/features/Drawing/utils/createCanvasContext';

export default function generateThumbnail(
  original: HTMLCanvasElement,
): HTMLCanvasElement {
  const { width, height } = original;
  const ctx = createCanvasContext((width * 3) / 16, (height * 3) / 16);
  ctx.drawImage(original, 0, 0, width, height, 0, 0, 180, 180);

  return ctx.canvas;
}
