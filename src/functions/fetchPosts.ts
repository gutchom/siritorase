import { PostNode } from '@/features/Drawing/types';

export default function fetchPosts(): Promise<PostNode[]> {
  return fetch('/api/posts').then((response) => response.json());
}
