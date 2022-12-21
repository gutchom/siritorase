export default function getMediaURL(path: string, hostname: string): string {
  const host =
    process.env.NODE_ENV === 'development'
      ? `http://${hostname}:9199`
      : 'https://firebasestorage.googleapis.com';
  const bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  return `${host}/v0/b/${bucket}/o/${path}?alt=media`;
}
