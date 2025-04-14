"use client"

import type React from "react"

import { Edit, Trash2 } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Character } from "@/lib/db"
import { SyncStatusIndicator } from "@/components/sync-status-indicator"

interface CharacterCardProps {
  character: Character
  onEdit: (character: Character) => void
  onDelete: (character: Character) => void
  onClick: (character: Character) => void
}

export function CharacterCard({ character, onEdit, onDelete, onClick }: CharacterCardProps) {
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit(character)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete(character)
  }

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md cursor-pointer" onClick={() => onClick(character)}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold truncate">{character.name}</h3>
            <p className="text-sm text-muted-foreground">
              Level {character.level}
              {character.class && ` ${character.class}`}
              {character.subclass && ` (${character.subclass})`}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <SyncStatusIndicator
              status={character.syncStatus}
              lastSynced={character.lastSyncedAt}
              className="scale-75 origin-right"
            />
            <Button variant="ghost" size="icon" onClick={handleEdit}>
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/50 px-4 py-2 flex justify-between">
        <span className="text-xs text-muted-foreground">
          Last updated: {new Date(character.updatedAt).toLocaleDateString()}
        </span>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDelete}>
          <Trash2 className="h-4 w-4 text-destructive" />
          <span className="sr-only">Delete</span>
        </Button>
      </CardFooter>
    </Card>
  )
}
