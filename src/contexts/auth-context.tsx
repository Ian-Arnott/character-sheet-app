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
  signInWithRedirect,
  getRedirectResult,
  sendPasswordResetEmail,
  browserLocalPersistence,
  setPersistence,
} from "firebase/auth"
import { auth } from "@/lib/firebase"
import { safeSessionStorage } from "@/lib/storage-utils"

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

// Check if we're in a mobile environment
const isMobile = () => {
  if (typeof window === "undefined") return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

// Check if the app is running as an installed PWA
const isPwa = () => {
  if (typeof window === "undefined") return false
  return window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [initialAuthCheckComplete, setInitialAuthCheckComplete] = useState(false)

  // Handle redirect result on component mount
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        // Check if we have a redirect result
        const result = await getRedirectResult(auth)
        if (result?.user) {
          // User successfully authenticated via redirect
          setUser(result.user)

          // Store a flag in our safe storage to indicate successful auth
          safeSessionStorage.setItem("auth_redirect_success", "true")
        }
      } catch (error: any) {
        console.error("Redirect sign-in error:", error)
        setError(getAuthErrorMessage(error.code))
      } finally {
        setLoading(false)
        setInitialAuthCheckComplete(true)
      }
    }

    // Check for redirect result
    handleRedirectResult()
  }, [])

  // Set up auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      if (!initialAuthCheckComplete) {
        setLoading(false)
        setInitialAuthCheckComplete(true)
      }
    })

    return () => unsubscribe()
  }, [initialAuthCheckComplete])

  const signIn = async (email: string, password: string) => {
    setError(null)
    try {
      // Set persistence based on environment
      const persistenceType = isPwa() ? browserLocalPersistence : browserLocalPersistence
      await setPersistence(auth, persistenceType)

      await signInWithEmailAndPassword(auth, email, password)
    } catch (error: any) {
      setError(getAuthErrorMessage(error.code))
      throw error
    }
  }

  const signUp = async (email: string, password: string) => {
    setError(null)
    try {
      // Set persistence based on environment
      const persistenceType = isPwa() ? browserLocalPersistence : browserLocalPersistence
      await setPersistence(auth, persistenceType)

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

      // Use different auth methods based on environment
      if (isMobile() && isPwa()) {
        // For mobile PWAs, use redirect method to avoid popup issues
        await signInWithRedirect(auth, provider)
        // The result will be handled in the useEffect above
      } else {
        // For desktop or mobile browser, use popup
        await signInWithPopup(auth, provider)
      }
    } catch (error: any) {
      // Ignore popup closed errors in PWA context
      if (isPwa() && error.code === "auth/popup-closed-by-user") {
        console.log("Popup closed, attempting redirect flow")
        const provider = new GoogleAuthProvider()
        await signInWithRedirect(auth, provider)
        return
      }

      setError(getAuthErrorMessage(error.code))
      throw error
    }
  }

  const signOut = async () => {
    setError(null)
    try {
      await firebaseSignOut(auth)
      // Clear any auth-related items from our safe storage
      safeSessionStorage.removeItem("auth_redirect_success")
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
    case "auth/operation-not-supported-in-this-environment":
      return "This operation is not supported in the current environment. Try again on a different device."
    case "auth/unauthorized-domain":
      return "This domain is not authorized for OAuth operations."
    case "auth/operation-not-allowed":
      return "This sign-in method is not allowed. Please contact support."
    default:
      return "An error occurred during authentication."
  }
}
