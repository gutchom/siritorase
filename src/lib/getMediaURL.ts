export default function getMediaURL(path: string): string {
  const host =
    process.env.NODE_ENV === 'development'
      ? `http://${process.env.NEXT_PUBLIC_HOST ?? 'localhost'}:9199`
      : 'https://firebasestorage.googleapis.com';
  const bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  return `${host}/v0/b/${bucket}/o/${encodeURIComponent(path)}?alt=media`;
}
