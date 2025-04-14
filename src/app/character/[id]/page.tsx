"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AppBar } from "@/components/app-bar"
import { Button } from "@/components/ui/button"
import { EditCharacterDrawer } from "@/components/edit-character-drawer"
import { useToast } from "@/hooks/use-toast"
import { useCharacterStore } from "@/store/character-store"
import type { Character } from "@/lib/db"
import ProtectedRoute from "@/components/auth/protected-route"

export default function CharacterDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const { characters, updateCharacter } = useCharacterStore()
  const [character, setCharacter] = useState<Character | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  useEffect(() => {
    const foundCharacter = characters.find((c) => c.id === params.id)
    if (foundCharacter) {
      setCharacter(foundCharacter)
    } else {
      // Character not found, redirect to dashboard
      toast({
        title: "Character not found",
        description: "The character you are looking for does not exist.",
        variant: "destructive",
      })
      router.push("/dashboard")
    }
  }, [characters, params.id, router, toast])

  const handleEditCharacter = () => {
    setIsDrawerOpen(true)
  }

  const handleSaveCharacter = async (id: string | null, data: Partial<Character>) => {
    if (!id || !character) return

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

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <AppBar
          title={character?.name || "Character Details"}
          showBackButton
          actions={
            <Button variant="ghost" size="sm" onClick={handleEditCharacter}>
              Edit
            </Button>
          }
        />

        <main className="flex-1 container max-w-md mx-auto p-4">
          {character ? (
            <div className="space-y-6">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h2 className="text-xl font-bold mb-4">{character.name}</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Level</p>
                    <p className="font-medium">{character.level}</p>
                  </div>
                  {character.class && (
                    <div>
                      <p className="text-sm text-muted-foreground">Class</p>
                      <p className="font-medium">{character.class}</p>
                    </div>
                  )}
                  {character.subclass && (
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Subclass</p>
                      <p className="font-medium">{character.subclass}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Character Sheet</h3>
                <p className="text-muted-foreground text-sm">
                  This is a placeholder for the full character sheet. In a complete application, this would display all
                  character details, abilities, equipment, etc.
                </p>
              </div>
            </div>
          ) : (
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-3/4"></div>
              <div className="h-32 bg-muted rounded-lg"></div>
              <div className="h-64 bg-muted rounded-lg"></div>
            </div>
          )}
        </main>

        {character && (
          <EditCharacterDrawer
            character={character}
            open={isDrawerOpen}
            onOpenChange={setIsDrawerOpen}
            onSave={handleSaveCharacter}
          />
        )}
      </div>
    </ProtectedRoute>
  )
}
