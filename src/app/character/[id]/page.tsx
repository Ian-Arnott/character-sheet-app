import { use } from "react"
import CharacterDetailClientPage from "./client-page"

export default function CharacterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap the params Promise using React.use()
  const resolvedParams = use(params)
  const characterId = resolvedParams.id

  return <CharacterDetailClientPage characterId={characterId} />
}
