"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { AppBar } from "@/components/app-bar"
import { getCharacterById } from "@/lib/db"
import { Character } from "@/types/character"
import CharacterSheet from "@/components/character/character-sheet"
import { ModeToggle } from "@/components/toggle-mode"
import EditDrawer from "@/components/character/edit-drawer"
import { useCharacterStore } from "@/store/character-store"

export default function CharacterPage() {
    const params = useParams()
    const characterId = Number(params.id)
    const [character, setCharacter] = useState<Character | null>(null)
    const [loading, setLoading] = useState(true)
    const { updateCharacter } = useCharacterStore()

    useEffect(() => {
        const loadCharacter = async () => {
            try {
                const characterData = await getCharacterById(characterId)
                setCharacter(characterData || null)
            } catch (error) {
                console.error("Failed to load character:", error)
            } finally {
                setLoading(false)
            }
        }

        loadCharacter()
    }, [characterId, character])

    if (loading) {
        return (
            <div className="flex min-h-screen flex-col">
                <AppBar title="Loading..." showBackButton={true} />
                <div className="container mx-auto px-4 py-6 flex justify-center items-center h-[80vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            </div>
        )
    }

    if (!character) {
        return (
            <div className="flex min-h-screen flex-col">
                <AppBar title="Character Not Found" showBackButton={true} />
                <div className="container mx-auto px-4 py-6 flex justify-center items-center h-[80vh]">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-2">Character Not Found</h2>
                        <p className="text-muted-foreground">The character you're looking for doesn't exist.</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen flex-col">
            <AppBar title={character.name} showBackButton={true} actions={[<ModeToggle />, <EditDrawer character={character} updateCharacter={updateCharacter} />]} />
            <CharacterSheet character={character} />
        </div>
    )
}
