"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import type { Character } from "@/lib/db"

const formSchema = z.object({
  name: z.string().min(1, "Character name is required").max(50, "Character name is too long"),
  level: z.coerce.number().min(1).max(20),
  class: z.string().min(1, "Class is required"),
  subclass: z.string().nullable(),
})

type FormValues = z.infer<typeof formSchema>

interface EditCharacterDrawerProps {
  character: Character | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (id: string | null, data: Partial<Character>) => Promise<void>
}

export function EditCharacterDrawer({ character, open, onOpenChange, onSave }: EditCharacterDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      level: 1,
      class: "",
      subclass: null,
    },
  })

  useEffect(() => {
    if (character) {
      form.reset({
        name: character.name,
        level: character.level,
        class: character.class,
        subclass: character.subclass,
      })
    } else {
      form.reset({
        name: "",
        level: 1,
        class: "",
        subclass: null,
      })
    }
  }, [character, form])

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)
    try {
      await onSave(character?.id || null, data)
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving character:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="flex justify-between items-center">
          <div>
            <DrawerTitle>{character ? "Edit Character" : "Create Character"}</DrawerTitle>
            <DrawerDescription>
              {character ? "Update your character's information" : "Create a new character for your adventures"}
            </DrawerDescription>
          </div>
          <DrawerClose asChild>
            <Button variant="ghost" size="icon">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </DrawerClose>
        </DrawerHeader>
        <div className="px-4 overflow-y-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Character Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter character name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Level</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} max={20} {...field} />
                    </FormControl>
                    <FormDescription>Character level (1-20)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="class"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter character class" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subclass"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subclass</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter character subclass (optional)"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    </FormControl>
                    <FormDescription>Optional subclass specialization</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DrawerFooter className="px-0">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Character"}
                </Button>
                <DrawerClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DrawerClose>
              </DrawerFooter>
            </form>
          </Form>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
