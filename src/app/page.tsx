"use client"
import CharacterAppBar from "@/components/character-app-bar"
import CharacterPanel from "@/components/character-panel"

export default function CharacterSheet() {
  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-900">
      <CharacterAppBar />
      <CharacterPanel />
    </main>
  )
}

