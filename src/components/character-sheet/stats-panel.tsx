import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCharacterStore } from "@/store/characterStore";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export default function StatsPanel() {
    const { stats, setCharacter } = useCharacterStore();

    return (
        <Card className="mt-4">
            <CardHeader>
                <CardTitle>Stats</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4">
                {Object.entries(stats).map(([stat, value]) => (
                    <div key={stat}>
                        <Label htmlFor={stat}>{stat}</Label>
                        <Input
                            id={stat}
                            name={stat}
                            type="number"
                            min="1"
                            max="30"
                            value={value}
                            onChange={(e) =>
                                setCharacter({
                                    stats: { ...stats, [stat]: parseInt(e.target.value) || 0 },
                                })
                            }
                        />
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
