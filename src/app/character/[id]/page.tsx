"use client"

import * as React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { AppBar } from "@/components/app-bar"
import { Button } from "@/components/ui/button"
import { EditCharacterDrawer } from "@/components/edit-character-drawer"
import { CharacterSheet } from "@/components/character-sheet/character-sheet"
import { useToast } from "@/hooks/use-toast"
import { useCharacterStore } from "@/store/character-store"
import type { Character } from "@/lib/db"
import ProtectedRoute from "@/components/auth/protected-route"
import { Save } from "lucide-react"

export default function CharacterDetailPage({ params }: { params: any }) {
  // Unwrap params using React.use() for future compatibility
  const unwrappedParams = React.use(params)
  const characterId = unwrappedParams.id

  const router = useRouter()
  const { toast } = useToast()
  const { characters, currentCharacter, updateCharacter, saveCharacter, isSaving } = useCharacterStore()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const handleEditCharacter = () => {
    setIsDrawerOpen(true)
  }

  const handleSaveCharacter = async (id: string | null, data: Partial<Character>) => {
    if (!id || !currentCharacter) return

    try {
      await updateCharacter(id, data)
      toast({
        title: "Character updated",
        description: `${data.name} has been updated.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update character.",
        variant: "destructive",
      })
      throw error
    }
  }

  const handleSyncCharacter = async () => {
    if (!currentCharacter) return

    try {
      await saveCharacter(currentCharacter.id)
      toast({
        title: "Character saved",
        description: "Your character has been saved to the cloud.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save character to the cloud.",
        variant: "destructive",
      })
    }
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <AppBar
          title={currentCharacter?.name || "Character Details"}
          showBackButton
          actions={
            <>
              {currentCharacter?.syncStatus === "local" && (
                <Button variant="outline" size="icon" onClick={handleSyncCharacter} disabled={isSaving}>
                  <Save className="h-4 w-4" />
                  <span className="sr-only">Save</span>
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={handleEditCharacter}>
                Edit
              </Button>
            </>
          }
        />

        <main className="flex-1 container max-w-2xl mx-auto p-4">
          <CharacterSheet characterId={characterId} />
        </main>

        {currentCharacter && (
          <EditCharacterDrawer
            character={currentCharacter}
            open={isDrawerOpen}
            onOpenChange={setIsDrawerOpen}
            onSave={handleSaveCharacter}
          />
        )}
      </div>
    </ProtectedRoute>
  )
}
