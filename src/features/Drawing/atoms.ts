import { atom } from 'jotai';

export const colors = [
  'white',
  'lightgray',
  'red',
  'pink',
  'yellow',
  'lightgreen',
  'cyan',
  'black',
  'gray',
  'brown',
  'purple',
  'orange',
  'green',
  'blue',
] as const;

export const strokeColorAtom = atom('black');

export const widths = [8, 24, 64] as const;

export const strokeWidthAtom = atom(24);

export type Point = { x: number; y: number };

export type Stroke = {
  width: number;
  color: string;
  points: Point[];
};

export const strokesAtom = atom<Stroke[]>([]);

export const canceledAtom = atom<Stroke[]>([]);
