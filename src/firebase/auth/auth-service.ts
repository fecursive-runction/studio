
'use client';

import {
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { initializeFirebase } from '@/firebase';

const { auth } = initializeFirebase();

export async function handleEmailPasswordSignUp(email: string, password: string) {
    try {
        await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
        console.error('Error signing up:', error);
        throw error;
    }
}

export async function handleEmailPasswordSignIn(email: string, password: string) {
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        console.error('Error signing in:', error);
        throw error;
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
