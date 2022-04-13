import { useState } from 'react';
import type { Auth, User } from '@firebase/auth';
import {
  TwitterAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
} from '@firebase/auth';
import { doc, setDoc } from '@firebase/firestore';
import { getFirebaseDb } from 'lib/firebase/browser';

export function useAuth(auth: Auth): {
  user: User | null;
  login(): void;
  logout(): void;
} {
  const [user, setUser] = useState<User | null>(null);
  onAuthStateChanged(auth, (user) => setUser(user));

  function login() {
    signInWithPopup(auth, new TwitterAuthProvider()).then(async (result) => {
      const uid = result.user.uid;
      const credential = TwitterAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken ?? '';
      const secret = credential?.secret ?? '';
      const db = getFirebaseDb();
      await setDoc(doc(db, 'users', uid), { token, secret });
    });
  }

  function logout() {
    auth.signOut().then();
  }

  return { user, login, logout };
}
