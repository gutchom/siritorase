export default function createCanvasContext(
  width: number,
  height: number,
): CanvasRenderingContext2D {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (context === null) throw new Error('canvas context is not available.');

  return context;
}
