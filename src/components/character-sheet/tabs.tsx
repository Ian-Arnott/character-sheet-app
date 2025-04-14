"use client"

import type * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface CharacterTabsProps {
  children: React.ReactNode
  defaultValue?: string
  className?: string
}

export function CharacterTabs({ children, defaultValue = "abilities", className }: CharacterTabsProps) {
  return (
    <Tabs defaultValue={defaultValue} className={cn("w-full", className)}>
      {children}
    </Tabs>
  )
}

interface CharacterTabsListProps {
  children: React.ReactNode
  className?: string
}

export function CharacterTabsList({ children, className }: CharacterTabsListProps) {
  return <TabsList className={cn("w-full grid grid-cols-4 h-12 bg-muted/50", className)}>{children}</TabsList>
}

interface CharacterTabsTriggerProps {
  value: string
  children: React.ReactNode
  className?: string
}

export function CharacterTabsTrigger({ value, children, className }: CharacterTabsTriggerProps) {
  return (
    <TabsTrigger value={value} className={cn("text-xs sm:text-sm", className)}>
      {children}
    </TabsTrigger>
  )
}

interface CharacterTabsContentProps {
  value: string
  children: React.ReactNode
  className?: string
}

export function CharacterTabsContent({ value, children, className }: CharacterTabsContentProps) {
  return (
    <TabsContent value={value} className={cn("pt-4", className)}>
      {children}
    </TabsContent>
  )
}
