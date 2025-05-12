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
  const { selectCharacter } = useCharacterStore()

  const router = useRouter()

  const handleRoute = () => {
    selectCharacter(character.id)
    router.push(`/character/${character.id}`)
  }


  return (
    <Card onClick={handleRoute} className="overflow-hidden transition-all hover:shadow-xl cursor-pointer">
      <CardHeader className="p-4 bg-gradient-to-r from-primary/15 to-primary/5">
        <div className="flex items-center justify-between">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg line-clamp-1">{character.name}</h3>
              <p className="text-sm text-muted-foreground">
                Level {character.level} {character.race} {character.class}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}
