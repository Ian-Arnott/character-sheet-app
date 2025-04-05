"use client"
import CharacterAppBar from "@/components/character-app-bar"
import CharacterPanel from "@/components/character-panel"
import ProtectedRoute from "@/components/protected-route"

export default function CharacterSheet() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-slate-100 dark:bg-slate-900">
        <CharacterAppBar />
        <CharacterPanel />
      </main>
    </ProtectedRoute>
  )
}

