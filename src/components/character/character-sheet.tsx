import { useCharacterStore } from "@/store/character-store";
import { Character } from "@/types/character";


interface CharacterSheetProps {
    character: Character;
}

export default function CharacterSheet({ character }: CharacterSheetProps) {

    return (
        <div className="container mx-auto px-4 py-6">
        </div>
    )
}