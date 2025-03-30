import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCharacterStore } from "@/store/characterStore";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Shield } from "lucide-react";

export default function CharacterInfo() {
    const { name, level, class: charClass, subclass, race, background, inspiration, setCharacter, proficiencyBonus } = useCharacterStore();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Character Info</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="grid  gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Character Name</Label>
                        <Input
                            id="name"
                            name="name"
                            value={name}
                            onChange={(e) => setCharacter({ name: e.target.value })}
                            placeholder="Gandalf"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="level">Level</Label>
                        <Input
                            id="level"
                            name="level"
                            type="number"
                            min="1"
                            max="20"
                            value={level}
                            onChange={(e) => {
                                setCharacter({ level: parseInt(e.target.value) || 1 });
                            }}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="class">Class</Label>
                        <Input
                            id="class"
                            name="class"
                            value={charClass}
                            onChange={(e) => setCharacter({ class: e.target.value })}
                            placeholder="Wizard"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="subclass">Subclass</Label>
                        <Input
                            id="subclass"
                            name="subclass"
                            value={subclass}
                            onChange={(e) => setCharacter({ subclass: e.target.value })}
                            placeholder="School of Evocation"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="race">Race</Label>
                        <Input
                            id="race"
                            name="race"
                            value={race}
                            placeholder="Human"

                            onChange={(e) => setCharacter({ race: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="background">Background</Label>
                        <Input
                            id="background"
                            name="background"
                            value={background}
                            placeholder="Sage"

                            onChange={(e) => setCharacter({ background: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex-1 text-center p-4 border rounded-md">
                            <div className="text-sm font-medium">Proficiency Bonus</div>
                            <div className="text-2xl font-bold">+{proficiencyBonus()}</div>
                        </div>
                        <div className="flex-1 text-center p-4 border rounded-md">
                            <div className="text-sm font-medium">Passive Perception</div>
                            <div className="text-2xl font-bold">10</div>
                        </div>
                        <div className="flex-1 text-center p-4 border rounded-md">
                            <div className="text-sm font-medium">Armor Class</div>
                            <div className="flex items-center justify-center">
                                <Shield className="h-4 w-4 mr-1 text-primary" />
                                <span className="text-2xl font-bold">10</span>
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col items-center justify-center space-y-2 p-4 border rounded-md">
                            <Label htmlFor="inspiration">Inspiration</Label>
                            <Switch
                                id="inspiration"
                                checked={inspiration}
                                onClick={(e) => setCharacter({ inspiration: (e.target as HTMLInputElement).checked })}
                            />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
