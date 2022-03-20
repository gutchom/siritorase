export type Point = { x: number; y: number };

export type ReplyType = {
  id: string;
  title: string;
};

export type PictureType = {
  url: string;
  title: string;
};

export type PictureDoc = {
  title: string;
  parents: ReplyType[];
};
