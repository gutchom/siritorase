import { atom } from 'recoil';

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

export type StrokeColor = typeof colors[number];

export const strokeColorState = atom<StrokeColor>({
  key: 'strokeColorState',
  default: 'black',
});

export const widths = [8, 24, 48] as const;

export type StrokeWidth = typeof widths[number];

export const strokeWidthState = atom<StrokeWidth>({
  key: 'strokeWidthState',
  default: 24,
});

export type StrokeType = 'pen' | 'eraser';

export const strokeTypeState = atom<StrokeType>({
  key: 'strokeTypeState',
  default: 'pen',
});

export type Stroke = {
  color: string;
  width: number;
  type: StrokeType;
  points: { x: number; y: number }[];
};

export const strokesState = atom<Stroke[]>({
  key: 'strokesState',
  default: [],
});

export const canceledStrokesState = atom<Stroke[]>({
  key: 'canceledStrokesState',
  default: [],
});
