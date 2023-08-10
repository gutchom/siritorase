import { PostItem } from '@/features/Drawing/types.ts';

export declare global {
  interface Window {
    siritorase: {
      ancestors?: PostItem[];
    };
  }
}
