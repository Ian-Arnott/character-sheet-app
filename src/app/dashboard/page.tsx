"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, WifiOff } from "lucide-react"
import { AppBar } from "@/components/app-bar"
import { CharacterCard } from "@/components/character-card"
import { EditCharacterDrawer } from "@/components/edit-character-drawer"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useCharacterStore } from "@/store/character-store"
import type { Character } from "@/lib/db"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import ProtectedRoute from "@/components/auth/protected-route"
import { useNetworkStatus } from "@/lib/network-utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function DashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const {
    characters,
    loading,
    error,
    fetchCharacters,
    createCharacter,
    updateCharacter,
    deleteCharacter,
    hasPendingChanges,
    checkPendingChanges,
  } = useCharacterStore()

  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [characterToDelete, setCharacterToDelete] = useState<Character | null>(null)
  const isOnline = useNetworkStatus()

  useEffect(() => {
    fetchCharacters()
    checkPendingChanges()

    const interval = setInterval(() => {
      checkPendingChanges()
    }, 30000) // Every 30 seconds

    return () => clearInterval(interval)
  }, [fetchCharacters, checkPendingChanges])

  const handleCreateCharacter = () => {
    if (characters.length >= 3) {
      toast({
        title: "Maximum characters reached",
        description: "You can only have up to 3 characters.",
        variant: "destructive",
      })
      return
    }

    setSelectedCharacter(null)
    setIsDrawerOpen(true)
  }

  const handleEditCharacter = (character: Character) => {
    setSelectedCharacter(character)
    setIsDrawerOpen(true)
  }

  const handleDeleteCharacter = (character: Character) => {
    setCharacterToDelete(character)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!characterToDelete) return

    try {
      await deleteCharacter(characterToDelete.id)
      toast({
        title: "Character deleted",
        description: `${characterToDelete.name} has been deleted.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete character.",
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setCharacterToDelete(null)
    }
  }

  const handleSaveCharacter = async (id: string | null, data: Partial<Character>) => {
    try {
      if (id) {
        await updateCharacter(id, data)
        toast({
          title: "Character updated",
          description: `${data.name} has been updated.`,
        })
      } else {
        await createCharacter(data)
        toast({
          title: "Character created",
          description: `${data.name} has been created.`,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save character.",
        variant: "destructive",
      })
      throw error
    }
  }

  const handleCharacterClick = (character: Character) => {
    router.push(`/character/${character.id}`)
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <AppBar
          title="Your Characters"
          actions={
            !isOnline ? (
              <div className="flex items-center gap-1 text-sm text-slate-500">
                <WifiOff className="h-4 w-4" />
                <span className="hidden sm:inline">Offline Mode</span>
              </div>
            ) : null
          }
        />

        <main className="flex-1 container max-w-md mx-auto p-4">
          {!isOnline && hasPendingChanges && (
            <Alert className="mb-4 bg-amber-50 border-amber-200">
              <WifiOff className="h-4 w-4 text-amber-500" />
              <AlertTitle>You're offline</AlertTitle>
              <AlertDescription>You have changes that will sync when you're back online.</AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            {loading && characters.length === 0 ? (
              <div className="text-center py-12">
                <div className="animate-pulse space-y-3">
                  <div className="h-24 bg-muted rounded-lg"></div>
                  <div className="h-24 bg-muted rounded-lg"></div>
                  <div className="h-24 bg-muted rounded-lg"></div>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-destructive">{error}</p>
                <Button variant="outline" className="mt-4" onClick={() => fetchCharacters()}>
                  Retry
                </Button>
              </div>
            ) : characters.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <h2 className="text-xl font-semibold">No Characters Yet</h2>
                <p className="text-muted-foreground">Create your first character to get started</p>
                <Button onClick={handleCreateCharacter}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Character
                </Button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Your Characters</h2>
                  {characters.length < 3 && (
                    <Button onClick={handleCreateCharacter}>
                      <Plus className="mr-2 h-4 w-4" />
                      New
                    </Button>
                  )}
                </div>

                <div className="grid gap-4">
                  {characters.map((character) => (
                    <CharacterCard
                      key={character.id}
                      character={character}
                      onEdit={handleEditCharacter}
                      onDelete={handleDeleteCharacter}
                      onClick={handleCharacterClick}
                    />
                  ))}
                </div>

                {characters.length < 3 && (
                  <div className="text-center pt-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      {3 - characters.length} character slot{characters.length === 2 ? "" : "s"} remaining
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </main>

        <EditCharacterDrawer
          character={selectedCharacter}
          open={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
          onSave={handleSaveCharacter}
        />

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Character</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {characterToDelete?.name}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {!isOnline && (
          <div className="fixed bottom-4 left-0 right-0 mx-auto w-max bg-amber-100 text-amber-800 px-4 py-2 rounded-full shadow-md flex items-center gap-2">
            <WifiOff className="h-4 w-4" />
            <span>Offline Mode - Changes saved locally</span>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
