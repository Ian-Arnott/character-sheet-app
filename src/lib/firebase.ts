import { initializeApp, getApps, getApp } from "firebase/app"
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurmentId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
const auth = getAuth(app)
const googleProvider = new GoogleAuthProvider()

export { auth, googleProvider }

export const createUser = async (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password)
}

export const signIn = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password)
}

export const signOut = async () => {
  return firebaseSignOut(auth)
}

export const signInWithGoogle = async () => {
  return signInWithPopup(auth, googleProvider)
}

