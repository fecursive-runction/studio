'use client';

import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from 'firebase/auth';
import { initializeFirebase } from '@/firebase';

const { auth } = initializeFirebase();
const provider = new GoogleAuthProvider();

export async function handleGoogleSignIn() {
  try {
    await signInWithPopup(auth, provider);
    // The onAuthStateChanged listener in FirebaseProvider will handle the redirect
  } catch (error) {
    console.error('Error during Google Sign-In:', error);
  }
}

export async function handleLogout() {
  try {
    await signOut(auth);
    // The onAuthStateChanged listener will clear user state and trigger redirect
  } catch (error) {
    console.error('Error signing out:', error);
  }
}
