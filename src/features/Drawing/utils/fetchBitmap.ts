export default function fetchBitmap(path: string): Promise<ImageBitmap> {
  return fetch(path)
    .then((res) => res.blob())
    .then((blob) => createImageBitmap(blob));
}
