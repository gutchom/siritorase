export type Point = { x: number; y: number };

export type PostType = {
  id: string;
  title: string;
  created: Date;
};

export type PictureDoc = {
  title: string;
  ancestors: PostType[];
  created: Date;
};
