import type { UploadResult } from '@firebase/storage';
import { ref, uploadBytes } from '@firebase/storage';
import { getFirebaseStorage } from 'lib/firebase/browser';

export default async function uploadMedia(
  path: string,
  blob: Blob,
): Promise<UploadResult> {
  return await uploadBytes(ref(getFirebaseStorage(), path), blob);
}
