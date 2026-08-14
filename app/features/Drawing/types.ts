import type { Timestamp } from '@firebase/firestore';

export type Point = { x: number; y: number };

export type PictureType = {
  id: string;
  src: string;
  title: string;
  created: Date;
};

export type PictureDoc = {
  title: string;
  ancestors: PictureType[];
  childrenCount: number;
  created: Timestamp;
  tweetId: string;
  userId: string;
};

export type PictureNode = PictureType & {
  parentId: string;
  tweetId: string;
  userId: string;
};
