"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { AppBar } from "@/components/app-bar"
import { getCharacterById } from "@/lib/db"
import type { Character } from "@/lib/db"

export default function CharacterPage() {
    const params = useParams()
    const characterId = Number(params.id)
    const [character, setCharacter] = useState<Character | null>(null)
    const [loading, setLoading] = useState(true)

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
    }, [characterId])

    if (loading) {
        return (
            <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-900">
                <AppBar title="Loading..." showBackButton={true} />
                <div className="container mx-auto px-4 py-6 flex justify-center items-center h-[80vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            </div>
        )
    }

    if (!character) {
        return (
            <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-900">
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
        <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-900">
            <AppBar title={character.name} showBackButton={true} />

        </div>
    )
}
