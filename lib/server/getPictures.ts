import type { PictureDoc, PictureNode } from 'features/Drawing/types';
import { db } from 'lib/server/firebase';
import getMediaURL from 'lib/getMediaURL';

export default async function getPictures(
  hostname: string,
): Promise<PictureNode[]> {
  const snapshot = await db.collection('pictures').get();

  return snapshot.docs.map((doc) => {
    const id = doc.id;
    const src = getMediaURL(`picture/${id}.png`, hostname);
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
