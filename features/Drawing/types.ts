export type AnswerType = {
  id: string;
  title: string;
};

export type PictureDoc = {
  title: string;
  parents: AnswerType[];
};
