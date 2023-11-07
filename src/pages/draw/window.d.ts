import { PostItem } from '@/features/Drawing/types';

export declare global {
  interface Window {
    siritorase: {
      ancestors?: PostItem[];
    };
  }
}
