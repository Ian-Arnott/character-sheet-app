"use client"

import { Cloud, CloudOff, RefreshCw, WifiOff } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useNetworkStatus } from "@/lib/network-utils"

interface SyncStatusIndicatorProps {
  status: "synced" | "local" | "syncing"
  lastSynced: number | null
  className?: string
  onClick?: () => void
}

export function SyncStatusIndicator({ status, lastSynced, className, onClick }: SyncStatusIndicatorProps) {
  const isOnline = useNetworkStatus()

  const getStatusIcon = () => {
    if (!isOnline) {
      return <WifiOff className="h-4 w-4 text-slate-500" />
    }

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
    if (!isOnline) {
      return "Offline mode"
    }

    switch (status) {
      case "synced":
        return `Synced${lastSynced ? ` at ${new Date(lastSynced).toLocaleTimeString()}` : ""}`
      case "local":
        return "Changes pending"
      case "syncing":
        return "Syncing..."
    }
  }

  const getStatusClass = () => {
    if (!isOnline) {
      return "bg-slate-100 text-slate-800"
    }

    switch (status) {
      case "synced":
        return "bg-green-100 text-green-800"
      case "local":
        return "bg-amber-100 text-amber-800"
      case "syncing":
        return "bg-blue-100 text-blue-800"
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={cn(
              "flex items-center gap-1 px-2 py-1 h-auto cursor-default",
              getStatusClass(),
              onClick && isOnline && status === "local" ? "cursor-pointer hover:opacity-80" : "",
              className,
            )}
            onClick={isOnline && status === "local" && onClick ? onClick : undefined}
          >
            {getStatusIcon()}
            <span className="hidden sm:inline">{getStatusText()}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>{getStatusText()}</p>
          {!isOnline && <p className="text-xs">Changes will sync when you're back online</p>}
          {isOnline && status === "local" && onClick && <p className="text-xs">Click to sync now</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
