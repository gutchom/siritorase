import {
  addDoc,
  collection,
  doc,
  increment,
  setDoc,
  updateDoc,
} from '@firebase/firestore';
import { getFirebaseDb } from 'lib/firebase/browser';
import type { PostType } from '../types';
import uploadMedia from './uploadMedia';
import canvasToBlob from './canvasToBlob';
import createOGP from './createOGP';

async function register(title: string, ancestors: PostType[]): Promise<string> {
  const [ancestor] = ancestors.slice(-1);
  const created = new Date();
  const post = { title, ancestors, created, childrenCount: 0 };
  const db = getFirebaseDb();
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

export async function complete(
  title: string,
  ancestors: PostType[],
  picture: HTMLCanvasElement,
  parentImages: HTMLImageElement[],
): Promise<[id: string, picture: Blob]> {
  let blob: Blob;
  const id = await register(title, ancestors);
  await Promise.all([
    uploadMedia(`picture/${id}.png`, (blob = await canvasToBlob(picture))),
    uploadMedia(
      `ogp/${id}.png`,
      await canvasToBlob(createOGP(picture, parentImages)),
    ),
  ]);

  return [id, blob];
}
