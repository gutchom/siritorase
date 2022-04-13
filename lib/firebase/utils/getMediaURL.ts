export default function getMediaURL(path: string): string {
  const host =
    process.env.NEXT_PUBLIC_ENV === 'development'
      ? `http://${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_EMULATOR_HOST}`
      : 'https://firebasestorage.googleapis.com';

  return `${host}/v0/b/${
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  }/o/${encodeURIComponent(path)}?alt=media`;
}
