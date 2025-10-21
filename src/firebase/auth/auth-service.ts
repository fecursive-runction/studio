'use client';

import {
  signInWithRedirect,
  GoogleAuthProvider,
  signOut,
} from 'firebase/auth';
import { initializeFirebase } from '@/firebase';

const { auth } = initializeFirebase();
const provider = new GoogleAuthProvider();

export async function handleGoogleSignIn() {
  try {
    // Using signInWithRedirect instead of signInWithPopup
    await signInWithRedirect(auth, provider);
    // The user will be redirected to Google's sign-in page.
    // After sign-in, they will be redirected back, and the onAuthStateChanged
    // listener in FirebaseProvider will handle the authentication result.
  } catch (error) {
    console.error('Error during Google Sign-In redirect:', error);
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
