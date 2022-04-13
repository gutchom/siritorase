import { initializeApp } from '@firebase/app';
import type { Auth } from '@firebase/auth';
import { getAuth } from '@firebase/auth';
import type { Firestore } from '@firebase/firestore';
import { connectFirestoreEmulator, getFirestore } from '@firebase/firestore';
import type { FirebaseStorage } from '@firebase/storage';
import { connectStorageEmulator, getStorage } from '@firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_MEASREMENT_ID,
};

export const app = initializeApp(firebaseConfig);

export function getFirebaseAuth(): Auth {
  return getAuth(app);
}

export function getFirebaseDb(): Firestore {
  const db = getFirestore(app);
  if (
    typeof window !== 'undefined' &&
    window.location.hostname === 'localhost'
  ) {
    connectFirestoreEmulator(db, 'localhost', 8080);
  }
  return db;
}

export function getFirebaseStorage(): FirebaseStorage {
  const storage = getStorage(app);
  if (
    typeof window !== 'undefined' &&
    window.location.hostname === 'localhost'
  ) {
    connectStorageEmulator(storage, 'localhost', 9199);
  }
  return storage;
}
