import type { PictureDoc, PictureType } from 'features/Drawing/types';
import { db } from 'lib/server/firebase';

export default async function getAncestors(
  id: string,
): Promise<Omit<PictureType, 'src'>[]> {
  const snapshot = await db.collection('pictures').doc(id).get();
  if (!snapshot.exists) {
    throw new RangeError('"pictures" does not have an id.');
  }
  const { title, ancestors, created } = snapshot.data() as PictureDoc;

  return JSON.parse(
    JSON.stringify([...ancestors, { id, title, created: created.toDate() }]),
  );
}
