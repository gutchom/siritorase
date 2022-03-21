export type Point = { x: number; y: number };

export type PicturePost = {
  id: string;
  title: string;
};

export type PictureDoc = {
  title: string;
  parents: PicturePost[];
};
