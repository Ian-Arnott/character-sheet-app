"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import {
  type User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth"
import { auth } from "@/lib/firebase"

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    setError(null)
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error: any) {
      setError(getAuthErrorMessage(error.code))
      throw error
    }
  }

  const signUp = async (email: string, password: string) => {
    setError(null)
    try {
      await createUserWithEmailAndPassword(auth, email, password)
    } catch (error: any) {
      setError(getAuthErrorMessage(error.code))
      throw error
    }
  }

  const signInWithGoogle = async () => {
    setError(null)
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
    } catch (error: any) {
      setError(getAuthErrorMessage(error.code))
      throw error
    }
  }

  const signOut = async () => {
    setError(null)
    try {
      await firebaseSignOut(auth)
    } catch (error: any) {
      setError(getAuthErrorMessage(error.code))
      throw error
    }
  }

  const resetPassword = async (email: string) => {
    setError(null)
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error: any) {
      setError(getAuthErrorMessage(error.code))
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        resetPassword,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Helper function to get user-friendly error messages
function getAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case "auth/invalid-email":
      return "Invalid email address format."
    case "auth/user-disabled":
      return "This account has been disabled."
    case "auth/user-not-found":
      return "No account found with this email."
    case "auth/wrong-password":
      return "Incorrect password."
    case "auth/email-already-in-use":
      return "An account with this email already exists."
    case "auth/weak-password":
      return "Password is too weak. Use at least 6 characters."
    case "auth/popup-closed-by-user":
      return "Sign-in popup was closed before completing the sign in."
    case "auth/cancelled-popup-request":
      return "The sign-in was cancelled."
    case "auth/popup-blocked":
      return "Sign-in popup was blocked by the browser."
    default:
      return "An error occurred during authentication."
  }
}
