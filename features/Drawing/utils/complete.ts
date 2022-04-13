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

async function register(
  title: string,
  ancestors: PostType[],
): Promise<[DocumentReference, DocumentReference]> {
  const [ancestor] = ancestors.slice(-1);
  const created = new Date();
  const post = { title, ancestors, created, childrenCount: 0 };
  const db = getFirebaseDb();
  const postRef = await addDoc(collection(db, 'pictures'), post);
  const childRef = doc(db, 'pictures', ancestor.id, 'children', postRef.id);
  await setDoc(childRef, post);
  await updateDoc(doc(db, 'pictures', ancestor.id), {
    childrenCount: increment(1),
  });

  return [postRef, childRef];
}

export async function complete(
  title: string,
  ancestors: PostType[],
  picture: HTMLCanvasElement,
  parentImages: HTMLImageElement[],
): Promise<[id: string, picture: Blob]> {
  const blob = await canvasToBlob(picture);
  const [postRef, childRef] = await register(title, ancestors);
  const id = postRef.id;
  await Promise.all([
    uploadMedia(`picture/${id}.png`, blob),
    createOGP(picture, parentImages).then((ogp) =>
      uploadMedia(`ogp/${id}.png`, ogp),
    ),
  ]).catch(() => {
    deleteDoc(postRef);
    deleteDoc(childRef);
  });

  return [id, blob];
}
