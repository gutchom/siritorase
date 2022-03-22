import { addDoc, collection, deleteDoc } from '@firebase/firestore';
import { getFirebaseDb } from 'lib/firebase/browser';
import { uploadMedia } from 'lib/firebase/utils';
import type { PicturePost, Point } from './types';

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      blob === null ? reject('blob is null') : resolve(blob);
    });
  });
}

function drawRoundSquare(
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  color: string,
  context: CanvasRenderingContext2D,
) {
  context.beginPath();
  context.lineWidth = 1;
  context.strokeStyle = color;
  context.fillStyle = color;
  context.moveTo(x, y + r);
  context.arc(x + r, y + h - r, r, Math.PI, Math.PI * 0.5, true);
  context.arc(x + w - r, y + h - r, r, Math.PI * 0.5, 0, true);
  context.arc(x + w - r, y + r, r, 0, Math.PI * 1.5, true);
  context.arc(x + r, y + r, r, Math.PI * 1.5, Math.PI, true);
  context.closePath();
  context.stroke();
  context.fill();
}

function createOGP(
  picture: HTMLCanvasElement,
  parents: HTMLImageElement[],
): Promise<Blob> {
  const ogp = document.createElement('canvas');
  ogp.width = 1200;
  ogp.height = 630;
  const ctx = ogp.getContext('2d');
  if (ctx === null) {
    throw new Error('canvas context is not available.');
  }

  // 背景色で塗りつぶし
  ctx.fillStyle = '#fd8';
  ctx.fillRect(0, 0, 1200, 630);

  // 枠付きの回答画像を描画
  drawRoundSquare(660 - 6, 60 - 6, 480 + 12, 480 + 12, 9, '#ea6', ctx);
  ctx.drawImage(picture, 660, 60, 480, 480);

  const size = 240;
  const positions: Point[] = [
    { x: 48, y: 240 + 6 + 60 - 120 - 4 },
    { x: 48 + size + 48 + 16, y: 240 + 6 + 60 - 120 - 4 },
  ];
  parents.slice(-2).forEach((image, index) => {
    drawRoundSquare(
      positions[index].x - 4,
      positions[index].y - 4,
      size + 8,
      size + 8,
      6,
      '#ea6',
      ctx,
    );
    ctx.drawImage(image, positions[index].x, positions[index].y, size, size);
  });

  return canvasToBlob(ogp);
}

export async function complete(
  title: string,
  parents: PicturePost[],
  picture: HTMLCanvasElement,
  parentImages: HTMLImageElement[],
): Promise<[id: string, picture: Blob]> {
  const blob = await canvasToBlob(picture);
  const db = getFirebaseDb();
  const docRef = await addDoc(collection(db, 'pictures'), {
    title,
    parents,
  });
  const id = docRef.id;
  await Promise.all([
    uploadMedia(`picture/${id}.png`, blob),
    createOGP(picture, parentImages).then((ogp) =>
      uploadMedia(`ogp/${id}.png`, ogp),
    ),
  ]).catch(() => deleteDoc(docRef));

  return [id, blob];
}
