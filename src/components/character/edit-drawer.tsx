"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Edit, Loader2 } from "lucide-react"
import type { Character } from "@/types/character"
import { Button } from "@/components/ui/button"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

const characterSchema = z.object({
    name: z.string().min(1, "Name is required"),
    race: z.string().min(1, "Race is required"),
    class: z.string().min(1, "Class is required"),
    // Changed to handle empty string instead of null
    subclass: z.string().optional(),
    background: z.string().min(1, "Background is required"),
    level: z.coerce.number().min(1, "Level must be at least 1").max(20, "Level cannot exceed 20"),
})

type CharacterFormValues = z.infer<typeof characterSchema>

interface EditDrawerProps {
    character: Character
    updateCharacter: (id: number, data: Partial<Character>) => Promise<void>
}

export default function EditDrawer({ character, updateCharacter }: EditDrawerProps) {
    const [open, setOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<CharacterFormValues>({
        resolver: zodResolver(characterSchema),
        defaultValues: {
            name: character.name,
            race: character.race,
            class: character.class,
            // Ensure subclass is always a string, never null
            subclass: character.subclass ?? "",
            background: character.background,
            level: character.level,
        },
    })

    const onSubmit = async (data: CharacterFormValues) => {
        try {
            setIsSubmitting(true)
            // Convert empty subclass back to null if needed for your API
            const submissionData = {
                ...data,
                subclass: data.subclass === "" ? null : data.subclass,
            }
            await updateCharacter(character.id!, submissionData)
            toast.success("Character updated", {
                description: `${data.name} has been successfully updated.`,
            })
            setOpen(false)
        } catch (error) {
            toast.error("Error", {
                description: "Failed to update character. Please try again.",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Edit character">
                    <Edit className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <div className="mx-auto w-full max-w-md">
                    <DrawerHeader>
                        <DrawerTitle className="text-center text-xl">Edit Character</DrawerTitle>
                    </DrawerHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Character name" {...field} />
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
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="race"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Race</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Character race" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="background"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Background</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Character background" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="class"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Class</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Character class" {...field} />
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
                                            <FormLabel>
                                                Subclass <span className="text-muted-foreground text-xs">(Optional)</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input placeholder="Character subclass" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <DrawerFooter className="px-0 pt-2">
                                <Button type="submit" className="w-full" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        "Save Changes"
                                    )}
                                </Button>
                                <DrawerClose asChild>
                                    <Button variant="outline" className="w-full">
                                        Cancel
                                    </Button>
                                </DrawerClose>
                            </DrawerFooter>
                        </form>
                    </Form>
                </div>
            </DrawerContent>
        </Drawer>
    )
}
