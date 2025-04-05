"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"
import { createUser, signIn, signOut, signInWithGoogle } from "@/lib/firebase"

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false)
  const { user, error, setError } = useAuthStore()
  const router = useRouter()

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)

    try {
      await signIn(email, password)
      router.push("/")
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("An unknown error occurred")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)

    try {
      await createUser(email, password)
      router.push("/")
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("An unknown error occurred")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)

    try {
      await signOut()
      router.push("/login")
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("An unknown error occurred")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const loginWithGoogle = async () => {
    setIsLoading(true)
    setError(null)

    try {
      await signInWithGoogle()
      router.push("/")
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("An unknown error occurred")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    loginWithGoogle,
  }
}

