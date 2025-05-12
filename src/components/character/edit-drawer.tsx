import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Character } from "@/types/character";
import { Button } from "../ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "../ui/drawer";
import { Input } from "../ui/input"; // Assuming you have an Input component
import { Edit } from "lucide-react";

const characterSchema = z.object({
    name: z.string().min(1, "Name is required"),
    race: z.string().min(1, "Race is required"),
    class: z.string().min(1, "Class is required"),
    subclass: z.string().nullable(),
    background: z.string().min(1, "Background is required"),
    level: z.number().min(1, "Level must be at least 1").max(20, "Level cannot exceed 20"),
});

type CharacterFormValues = z.infer<typeof characterSchema>;

interface EditDrawerProps {
    character: Character;
    updateCharacter: (id: number, data: Partial<Character>) => Promise<void>;
}

export default function EditDrawer({ character, updateCharacter }: EditDrawerProps) {
    const { register, handleSubmit, formState: { errors } } = useForm<CharacterFormValues>({
        resolver: zodResolver(characterSchema),
        defaultValues: {
            name: character.name,
            race: character.race,
            class: character.class,
            subclass: character.subclass,
            background: character.background,
            level: character.level,
        },
    });

    const onSubmit = async (data: CharacterFormValues) => {
        await updateCharacter(character.id!, data);
    };

    return (
        <Drawer>
            <DrawerTrigger>
                <Button variant="outline" size="icon" className="cursor-pointer">
                    <Edit className="h-4 w-4" />
                </Button>
            </DrawerTrigger>
            <DrawerContent className="min-h-150">
                <DrawerHeader className="flex justify-center items-center">
                    <DrawerTitle>Edit Character Info</DrawerTitle>
                </DrawerHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DrawerDescription className="flex flex-col gap-4 p-5">
                        <div>
                            <label htmlFor="name">Name</label>
                            <Input id="name" {...register("name")} />
                            {errors.name && <span className="text-red-500">{errors.name.message}</span>}
                        </div>
                        <div>
                            <label htmlFor="race">Race</label>
                            <Input id="race" {...register("race")} />
                            {errors.race && <span className="text-red-500">{errors.race.message}</span>}
                        </div>
                        <div>
                            <label htmlFor="class">Class</label>
                            <Input id="class" {...register("class")} />
                            {errors.class && <span className="text-red-500">{errors.class.message}</span>}
                        </div>
                        <div>
                            <label htmlFor="subclass">Subclass</label>
                            <Input id="subclass" {...register("subclass")} />
                            {errors.subclass && <span className="text-red-500">{errors.subclass.message}</span>}
                        </div>
                        <div>
                            <label htmlFor="background">Background</label>
                            <Input id="background" {...register("background")} />
                            {errors.background && <span className="text-red-500">{errors.background.message}</span>}
                        </div>
                        <div>
                            <label htmlFor="level">Level</label>
                            <Input id="level" type="number" {...register("level", { valueAsNumber: true })} />
                            {errors.level && <span className="text-red-500">{errors.level.message}</span>}
                        </div>
                    </DrawerDescription>
                    <DrawerFooter className="flex flex-col gap-2">
                        <DrawerClose>
                            <Button type="submit" className="w-full">Submit</Button>
                        </DrawerClose>
                        <DrawerClose>
                            <Button variant="outline" className="w-full">Cancel</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </form>
            </DrawerContent>
        </Drawer>
    );
}