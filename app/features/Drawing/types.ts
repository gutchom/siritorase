export type Point = { x: number; y: number };

export type PictureType = {
  id: string;
  src: string;
  title: string;
  created: Date;
  tweetId?: string;
  tweetUserId?: string;
};

export type PictureNode = PictureType & {
  parentId: string;
  tweetId: string;
  userId: string;
};
