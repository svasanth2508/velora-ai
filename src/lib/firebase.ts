import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User,
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, collection, onSnapshot, query, where } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Storage
export const storage = getStorage(app);

// Initialize Firestore with specific database ID if available
export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export const formatAuthError = (error: any): string => {
  if (!error) return 'An unknown authentication error occurred.';
  const code = error?.code || '';
  const message = error?.message || String(error);

  if (
    code === 'auth/admin-restricted-operation' ||
    code === 'auth/operation-not-allowed' ||
    message.includes('admin-restricted-operation') ||
    message.includes('operation-not-allowed')
  ) {
    return 'This authentication method (Email or Guest Sign-In) is restricted in your Firebase Console project settings. Please use Google Sign-In or enable Email/Anonymous authentication in Firebase Console > Authentication > Sign-in method.';
  }
  if (code === 'auth/unauthorized-domain' || message.includes('unauthorized-domain')) {
    return `This domain ("${window.location.hostname}") is not authorized for Google Sign-In in Firebase Console. Please add it under Firebase Console > Authentication > Settings > Authorized domains.`;
  }
  if (code === 'auth/popup-blocked') {
    return 'The sign-in popup was blocked by your browser. Please allow popups for this app.';
  }
  if (code === 'auth/popup-closed-by-user') {
    return 'Sign-in popup was closed before completing authentication.';
  }
  if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
    return 'Invalid email address or password. Click "Create Account" if you do not have one yet.';
  }
  if (code === 'auth/email-already-in-use') {
    return 'An account with this email address already exists. Please sign in instead.';
  }
  if (code === 'auth/weak-password') {
    return 'Password is too weak. Please use at least 6 characters.';
  }
  return message;
};

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.warn('Google Sign-In Notice:', error);
    if (
      error?.code === 'auth/unauthorized-domain' ||
      error?.message?.includes('unauthorized-domain') ||
      error?.code === 'auth/popup-blocked'
    ) {
      console.info('Attempting guest/anonymous authentication fallback due to domain authorization restriction...');
      try {
        const anonResult = await signInAnonymously(auth);
        return anonResult.user;
      } catch (anonErr: any) {
        console.warn('Anonymous login fallback restricted:', anonErr);
      }
    }
    throw new Error(formatAuthError(error));
  }
};

export const loginWithEmail = async (email: string, pass: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    return result.user;
  } catch (error: any) {
    throw new Error(formatAuthError(error));
  }
};

export const registerWithEmail = async (email: string, pass: string, name: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    if (result.user && name) {
      await updateProfile(result.user, { displayName: name });
    }
    return result.user;
  } catch (error: any) {
    throw new Error(formatAuthError(error));
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('Error signing out:', error);
    throw new Error(formatAuthError(error));
  }
};

export const loginAnonymously = async () => {
  try {
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (error: any) {
    console.error('Error signing in anonymously:', error);
    throw new Error(formatAuthError(error));
  }
};

export const resetPasswordEmail = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    throw new Error(formatAuthError(error));
  }
};

export { onAuthStateChanged };
export type { User };
