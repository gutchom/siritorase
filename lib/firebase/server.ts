import admin from 'firebase-admin';
import { applicationDefault, initializeApp } from 'firebase-admin/lib/app';
import type { Firestore } from 'firebase-admin/lib/firestore';
import { getFirestore } from 'firebase-admin/lib/firestore';
import type { Storage } from 'firebase-admin/lib/storage';
import { getStorage } from 'firebase-admin/lib/storage';

admin.initializeApp();

export const app = initializeApp({
  credential: applicationDefault(),
  databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com`,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
});

export const getFirebaseDb = (): Firestore => getFirestore(app);
export const getFirebaseStorage = (): Storage => getStorage(app);
