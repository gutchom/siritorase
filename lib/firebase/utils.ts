import type { UploadResult } from '@firebase/storage';
import { ref, uploadBytes } from '@firebase/storage';
import { getFirebaseStorage } from 'lib/firebase/browser';

export function getMediaURL(path: string): string {
  return `https://firebasestorage.googleapis.com/v0/b/${
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  }/o/${encodeURIComponent(path)}?alt=media`;
}

export async function uploadMedia(
  path: string,
  blob: Blob,
): Promise<UploadResult> {
  return await uploadBytes(ref(getFirebaseStorage(), path), blob);
}
