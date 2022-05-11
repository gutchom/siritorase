import type { Timestamp } from '@firebase/firestore';

export type Point = { x: number; y: number };

export type PostType = {
  id: string;
  src: string;
  title: string;
  created: Date;
};

export type PictureDoc = {
  title: string;
  ancestors: PostType[];
  childrenCount: number;
  created: Timestamp;
};

export type PictureNode = Omit<PostType, 'created'> & {
  parentId: string;
};
