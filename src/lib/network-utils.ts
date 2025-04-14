"use client"

import React from "react"

/**
 * Network status utility to detect and monitor network connectivity
 */

type NetworkStatusListener = (online: boolean) => void

class NetworkStatusManager {
  private online: boolean
  private listeners: NetworkStatusListener[] = []

  constructor() {
    this.online = typeof navigator !== "undefined" ? navigator.onLine : true

    if (typeof window !== "undefined") {
      window.addEventListener("online", this.handleOnline)
      window.addEventListener("offline", this.handleOffline)
    }
  }

  private handleOnline = () => {
    this.online = true
    this.notifyListeners()
  }

  private handleOffline = () => {
    this.online = false
    this.notifyListeners()
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.online))
  }

  public addListener(listener: NetworkStatusListener) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  public isOnline(): boolean {
    return this.online
  }

  public cleanup() {
    if (typeof window !== "undefined") {
      window.removeEventListener("online", this.handleOnline)
      window.removeEventListener("offline", this.handleOffline)
    }
    this.listeners = []
  }
}

// Create a singleton instance
export const networkStatus = new NetworkStatusManager()

// React hook for network status
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = React.useState(networkStatus.isOnline())

  React.useEffect(() => {
    const unsubscribe = networkStatus.addListener((online) => {
      setIsOnline(online)
    })

    return unsubscribe
  }, [])

  return isOnline
}
