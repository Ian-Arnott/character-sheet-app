import CharacterList from "@/components/character-list"
import { AppBar } from "@/components/app-bar"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-900">
      <AppBar title="D&D Character Sheets" />
      <div className="container mx-auto px-4 py-6">
        <CharacterList />
      </div>
    </main>
  )
}
