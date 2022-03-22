export type Point = { x: number; y: number };

export type PostType = {
  id: string;
  title: string;
  createdAt: Date;
};

export type PictureDoc = {
  title: string;
  ancestors: PostType[];
  createdAt: Date;
};
