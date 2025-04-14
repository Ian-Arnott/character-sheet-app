"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { ChevronLeft, Menu, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"
import { ModeToggle } from "./toggle-mode"

interface AppBarProps {
  title: string
  showBackButton?: boolean
  onMenuClick?: () => void
  actions?: React.ReactNode
}

export function AppBar({ title, showBackButton = false, onMenuClick, actions }: AppBarProps) {
  const router = useRouter()
  const { signOut } = useAuth()

  const handleBackClick = () => {
    router.back()
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/login")
  }

  return (
    <div className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2">
        {showBackButton ? (
          <Button variant="ghost" size="icon" onClick={handleBackClick} className="mr-2">
            <ChevronLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Button>
        ) : onMenuClick ? (
          <Button variant="ghost" size="icon" onClick={onMenuClick} className="mr-2">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Menu</span>
          </Button>
        ) : null}
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        {actions}
        <ModeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
              <span className="sr-only">More options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleSignOut}>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
