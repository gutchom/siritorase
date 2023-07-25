import type { PictureDoc, PictureNode } from 'src/features/Drawing/types';
import { db } from 'src/lib/server/firebase';
import getMediaURL from 'src/lib/getMediaURL';

export default async function getPictures(): Promise<PictureNode[]> {
  const snapshot = await db.collection('pictures').get();

  return snapshot.docs.map((doc) => {
    const id = doc.id;
    const src = getMediaURL(`picture/${id}.png`);
    const { title, ancestors, tweetId, userId, created } =
      doc.data() as PictureDoc;
    const [parent] = ancestors.slice(-1);

    return {
      id,
      src,
      title,
      created: created.toDate(),
      parentId: parent?.id ?? '',
      tweetId: tweetId ?? '',
      userId: userId ?? '',
    };
  });
}
