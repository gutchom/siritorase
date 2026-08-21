export type Point = { x: number; y: number };

export type PictureType = {
  id: string;
  src: string;
  title: string;
  created: Date;
  tweetId?: string | null;
  tweetScreenName?: string | null;
};

export type PictureNode = PictureType & {
  parentId: string;
  userId: string | null;
};
