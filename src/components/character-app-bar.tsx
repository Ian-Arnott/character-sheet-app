"use client"

import { useCharacterStore } from "../store/characterStore"
import { SizedBox } from "./ui/sized-box"

export default function CharacterAppBar() {
  const { name, class: charClass, subclass, level } = useCharacterStore()


  return (
    <><div className="fixed w-full bg-slate-800 text-white p-4 shadow-md">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <h1 className="text-2xl font-bold">{name || "Unnamed Character"}</h1>
          <div className="flex items-center gap-2 text-sm md:text-base">
            <span className="px-2 py-1 bg-slate-700 rounded">{charClass || "No Class"}</span>
            {subclass && <span className="px-2 py-1 bg-slate-700 rounded">{subclass || ""}</span>}
            <span className="px-2 py-1 bg-slate-700 rounded">Level {level}</span>
          </div>
        </div>
      </div>
    </div><SizedBox className="w-full h-25" /></>
  )
}

