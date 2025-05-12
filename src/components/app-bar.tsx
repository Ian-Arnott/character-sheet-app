"use client"

import { ArrowLeft, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import React from "react"

interface AppBarProps {
  title: string
  actions?: React.ReactNode
  showBackButton?: boolean
}

export function AppBar({ title, actions, showBackButton = false }: AppBarProps) {
  const router = useRouter()

  return (
    <header className="sticky top-0 z-10 w-full border-b">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {showBackButton && (
            <Button variant="ghost" size="icon" className="mr-1 cursor-pointer" onClick={() => router.back()} aria-label="Go back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-xl font-bold">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          {Array.isArray(actions)
            ? actions.map((action, index) => <React.Fragment key={index}>{action}</React.Fragment>)
            : actions}
        </div>
      </div>
    </header>
  )
}
