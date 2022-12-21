import {
  addDoc,
  collection,
  doc,
  increment,
  setDoc,
  updateDoc,
} from '@firebase/firestore';
import { ref, uploadBytes } from '@firebase/storage';
import { db, storage } from 'lib/browser/firebase';
import type { PictureType } from '../types';
import generateOGP from './OGP';

export default async function post(
  title: string,
  picture: HTMLCanvasElement,
  ancestors: PictureType[],
  ancestorImages: HTMLImageElement[],
): Promise<string> {
  const id = await register(title, ancestors);
  await Promise.all([
    upload(`picture/${id}.png`, await canvasToBlob(picture)),
    upload(
      `ogp/${id}.png`,
      await canvasToBlob(
        await generateOGP(title, picture, ancestors, ancestorImages),
      ),
    ),
  ]);

  return id;
}

async function register(
  title: string,
  ancestors: PictureType[],
): Promise<string> {
  const [ancestor] = ancestors.slice(-1);
  const created = new Date();
  const post = { title, ancestors, created, childrenCount: 0 };
  const postRef = await addDoc(collection(db, 'pictures'), post);
  if (ancestor) {
    const childRef = doc(db, 'pictures', ancestor.id, 'children', postRef.id);
    await setDoc(childRef, post);
    await updateDoc(doc(db, 'pictures', ancestor.id), {
      childrenCount: increment(1),
    });
  }

  return postRef.id;
}

async function upload(path: string, blob: Blob) {
  await uploadBytes(ref(storage, path), blob);
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      blob === null ? reject('blob is null') : resolve(blob);
    });
  });
}
