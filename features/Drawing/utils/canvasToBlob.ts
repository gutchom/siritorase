export default function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      blob === null ? reject('blob is null') : resolve(blob);
    });
  });
}
