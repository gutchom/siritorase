import md5 from 'js-md5';
import { doc, setDoc } from '@firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';
import type { RefObject } from 'react';
import type { AnswerType, Point } from 'features/Drawing/types';
import { getFirebaseDb, getFirebaseStorage } from 'lib/firebase/browser';

const MIME_TYPE = 'image/png';

async function getId(blob: Blob): Promise<string> {
  return md5(await blob.arrayBuffer());
}

async function uploadPicture(blob: Blob, id: string): Promise<void> {
  const storage = getFirebaseStorage();
  const pictureRef = ref(storage, `picture/${id}.png`);
  await uploadBytes(pictureRef, blob, { contentType: MIME_TYPE });
}

async function uploadOGP(blob: Blob, id: string): Promise<void> {
  const storage = getFirebaseStorage();
  const ogpRef = ref(storage, `ogp/${id}.png`);
  await uploadBytes(ogpRef, blob, { contentType: MIME_TYPE });
}

async function register(
  id: string,
  title: string,
  parents: AnswerType[],
): Promise<void> {
  const db = getFirebaseDb();
  await setDoc(doc(db, 'pictures', id), { title, parents });
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
  canvasPic: HTMLCanvasElement,
  images: HTMLImageElement[],
): Promise<Blob> {
  const canvasOGP = document.createElement('canvas');
  canvasOGP.width = 1200;
  canvasOGP.height = 630;
  const ctx = canvasOGP.getContext('2d');
  if (ctx === null) {
    throw new Error('canvas context is not available.');
  }

  // 背景色で塗りつぶし
  ctx.fillStyle = '#fd8';
  ctx.fillRect(0, 0, 1200, 630);

  // 枠付きの回答画像を描画
  drawRoundSquare(660 - 6, 60 - 6, 480 + 12, 480 + 12, 8, '#ea6', ctx);
  ctx.drawImage(canvasPic, 660, 60, 480, 480);

  const points: Point[] = [
    { x: 60 + 32, y: 60 + 32 },
    { x: 60 + 32 + 192 + 32, y: 60 + 32 },
    { x: 60 + 32, y: 60 + 32 + 192 + 32 },
    { x: 60 + 32 + 192 + 32, y: 60 + 32 + 192 + 32 },
  ];
  images.slice(-4).forEach((image, index) => {
    ctx.drawImage(image, points[index].x, points[index].y, 192, 192);
  });

  return new Promise((resolve, reject) => {
    canvasOGP.toBlob((blob) => {
      if (blob === null) {
        reject();
        return;
      }
      resolve(blob);
    }, MIME_TYPE);
  });
}

export async function complete(
  canvasRef: RefObject<HTMLCanvasElement>,
  title: string,
  parents: AnswerType[],
  images: HTMLImageElement[],
): Promise<[id: string, picture: Blob]> {
  return new Promise((resolve, reject) => {
    canvasRef.current?.toBlob(async (blob) => {
      if (blob === null) {
        reject('blob is null.');
        return;
      }
      if (canvasRef.current === null) {
        reject('canvasRef is null.');
        return;
      }

      const id = await getId(blob);
      await Promise.all([
        uploadPicture(blob, id),
        createOGP(canvasRef.current, images).then((ogp) => uploadOGP(ogp, id)),
      ]);
      await register(id, title, parents);

      resolve([id, blob]);
    }, MIME_TYPE);
  });
}
