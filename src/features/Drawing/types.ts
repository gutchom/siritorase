export type PostItem = {
  id: string;
  title: string;
};

export type PostNode = PostItem & {
  parent: string;
  user?: string;
};
