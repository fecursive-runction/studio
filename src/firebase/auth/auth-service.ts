'use client';

import {
  signInWithRedirect,
  GoogleAuthProvider,
  signOut,
} from 'firebase/auth';
import { initializeFirebase } from '@/firebase';

const { auth } = initializeFirebase();
const provider = new GoogleAuthProvider();

export function handleGoogleSignIn() {
  // Using signInWithRedirect instead of signInWithPopup
  // The user will be redirected to Google's sign-in page.
  // After sign-in, they will be redirected back, and the onAuthStateChanged
  // listener in FirebaseProvider will handle the authentication result.
  signInWithRedirect(auth, provider);
}

export async function handleLogout() {
  try {
    await signOut(auth);
    // The onAuthStateChanged listener will clear user state and trigger redirect
  } catch (error) {
    console.error('Error signing out:', error);
  }
}
