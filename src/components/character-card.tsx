"use client"

import { Card, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useCharacterStore } from "@/store/character-store"
import { useRouter } from "next/navigation"
import { Character } from "@/types/character"

interface CharacterCardProps {
  character: Character
}

export default function CharacterCard({ character }: CharacterCardProps) {
  const { deleteCharacter, selectCharacter } = useCharacterStore()

  const router = useRouter()

  const handleRoute = () => {
    selectCharacter(character.id)
    router.push(`/character/${character.id}`)
  }

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this character?")) {
      await deleteCharacter(character.id)
    }
  }

  return (
    <Card onClick={handleRoute} className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="p-4 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="flex items-center justify-between">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg line-clamp-1">{character.name}</h3>
              <p className="text-sm text-muted-foreground">
                Level {character.level} {character.race} {character.class}
              </p>
            </div>
          </div>
          <Button onClick={handleDelete} variant="ghost" size="sm" className="text-destructive">
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </CardHeader>
    </Card>
  )
}
