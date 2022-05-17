export default function getMediaURL(path: string, hostname: string): string {
  const host =
    hostname.indexOf('local') >= 0
      ? `http://${hostname}:9199`
      : 'https://firebasestorage.googleapis.com';
  return `${host}/v0/b/${
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  }/o/${encodeURIComponent(path)}?alt=media`;
}
