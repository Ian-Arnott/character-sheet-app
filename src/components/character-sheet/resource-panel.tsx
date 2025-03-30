import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCharacterStore } from "@/store/characterStore";

export default function ResourcesPanel() {
    const { resources, setCharacter } = useCharacterStore();

    return (
        <Card className="mt-4">
            <CardHeader>
                <CardTitle>Resources</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
                {Object.entries(resources).map(([resource, value]) => (
                    <div key={resource}>
                        <p className="text-sm text-muted-foreground">{resource}</p>
                        <input
                            className="text-lg font-bold w-full bg-transparent border-none outline-none"
                            type="number"
                            value={value}
                            onChange={(e) =>
                                setCharacter({
                                    resources: {
                                        ...resources,
                                        [resource]: parseInt(e.target.value) || 0,
                                    },
                                })
                            }
                        />
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
