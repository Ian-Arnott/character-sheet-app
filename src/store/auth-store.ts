import { create } from "zustand"
import type { User } from "firebase/auth"
import { auth } from "@/lib/firebase"

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}))

// Initialize auth state listener
if (typeof window !== "undefined") {
  auth.onAuthStateChanged((user) => {
    useAuthStore.getState().setUser(user)
    useAuthStore.getState().setLoading(false)
  })
}

