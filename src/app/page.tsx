import CharacterList from "@/components/character-list"
import { AppBar } from "@/components/app-bar"
import { ModeToggle } from "@/components/toggle-mode"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <AppBar title="D&D Character Sheets" actions={<ModeToggle />} />
      <div className="container mx-auto px-4 py-6">
        <CharacterList />
      </div>
    </main>
  )
}
