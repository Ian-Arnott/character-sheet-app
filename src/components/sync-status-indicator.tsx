"use client"

import { Cloud, CloudOff, RefreshCw } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface SyncStatusIndicatorProps {
  status: "synced" | "local" | "syncing"
  lastSynced: number | null
  className?: string
  onClick?: () => void
}

export function SyncStatusIndicator({ status, lastSynced, className, onClick }: SyncStatusIndicatorProps) {
  const getStatusIcon = () => {
    switch (status) {
      case "synced":
        return <Cloud className="h-4 w-4 text-green-500" />
      case "local":
        return <CloudOff className="h-4 w-4 text-amber-500" />
      case "syncing":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
    }
  }

  const getStatusText = () => {
    switch (status) {
      case "synced":
        return `Synced${lastSynced ? ` at ${new Date(lastSynced).toLocaleTimeString()}` : ""}`
      case "local":
        return "Changes not saved to cloud"
      case "syncing":
        return "Syncing..."
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className={cn(
              "flex items-center gap-1 text-xs rounded-full px-2 py-1",
              status === "synced" ? "bg-green-100 text-green-800" : "",
              status === "local" ? "bg-amber-100 text-amber-800" : "",
              status === "syncing" ? "bg-blue-100 text-blue-800" : "",
              onClick ? "cursor-pointer hover:opacity-80" : "cursor-default",
              className,
            )}
            onClick={onClick}
            disabled={status === "syncing"}
          >
            {getStatusIcon()}
            <span className="hidden sm:inline">{getStatusText()}</span>
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getStatusText()}</p>
          {status === "local" && onClick && <p className="text-xs">Click to sync</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
