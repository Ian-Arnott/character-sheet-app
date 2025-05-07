"use client"

import { PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCharacterStore } from "@/store/character-store"

export default function EmptyState() {
  const { createCharacter } = useCharacterStore()

  const handleCreateCharacter = () => {
    createCharacter()
  }

  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center p-4">
      <div className="bg-primary/10 rounded-full p-6 mb-6">
        <PlusCircle className="h-12 w-12 text-primary" />
      </div>
      <h2 className="text-2xl font-bold mb-2">No Characters Yet</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        Create your first character sheet.
      </p>
      <Button onClick={handleCreateCharacter} size="lg" className="flex items-center gap-2">
        <PlusCircle className="h-5 w-5" />
        Create Your First Character
      </Button>
    </div>
  )
}
