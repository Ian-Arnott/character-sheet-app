"use client"

import { useEffect, useState } from "react"
import { PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import CharacterCard from "@/components/character-card"
import EmptyState from "@/components/empty-state"
import { useCharacterStore } from "@/store/character-store"

export default function CharacterList() {
  const { characters, createCharacter, fetchCharacters } = useCharacterStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadCharacters = async () => {
      await fetchCharacters()
      setIsLoading(false)
    }

    loadCharacters()
  }, [fetchCharacters])

  const handleCreateCharacter = () => {
    createCharacter()
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (characters.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Your Characters</h2>
        <Button onClick={handleCreateCharacter} size="sm" className="flex items-center gap-1 cursor-pointer">
          <PlusCircle className="h-4 w-4" />
          <span>New Character</span>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {characters.map((character) => (
          <CharacterCard key={character.id} character={character} />
        ))}
      </div>
    </div>
  )
}
