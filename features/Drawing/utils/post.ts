import type { PictureType } from '../types';
import generateOGP from './OGP';

export default async function post(
  title: string,
  picture: HTMLCanvasElement,
  ancestors: PictureType[],
  ancestorImages: HTMLImageElement[],
): Promise<string> {
  const id = '';
  await Promise.all([
    upload(`picture/${id}.png`, await toBlob(picture)),
    upload(
      `ogp/${id}.png`,
      await toBlob(
        await generateOGP(title, picture, ancestors, ancestorImages),
      ),
    ),
  ]);

  return id;
}

async function upload(path: string, blob: Blob) {
  await uploadBytes(ref(storage, path), blob);
}

function toBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) =>
      blob ? resolve(blob) : reject(new TypeError('blob is null')),
    );
  });
}
