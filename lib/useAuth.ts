import { useEffect, useState } from 'react';
import type { User } from '@firebase/auth';
import {
  TwitterAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
} from '@firebase/auth';
import { doc, setDoc } from '@firebase/firestore';
import { auth, db } from 'lib/browser/firebase';

export default function useAuth(): {
  user: User | null;
  login(): Promise<void>;
  logout(): Promise<void>;
} {
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => setUser(user));
    return () => {
      unsubscribe();
    };
  }, []);

  async function login() {
    const result = await signInWithPopup(auth, new TwitterAuthProvider());
    const credential = TwitterAuthProvider.credentialFromResult(result);
    if (!credential) {
      throw new Error('Can not get OAuth credential');
    }
    const { accessToken: token, secret } = credential;
    await setDoc(doc(db, 'users', result.user.uid), { token, secret });
  }

  async function logout() {
    await auth.signOut();
  }

  return { user, login, logout };
}
