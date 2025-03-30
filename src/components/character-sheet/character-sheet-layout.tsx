import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import CharacterInfo from "./character-info";
import StatsPanel from "./stats-panel";
import ResourcesPanel from "./resource-panel";

export default function CharacterSheetLayout() {
    return (
        <div className="p-4 max-w-4xl mx-auto">
            <CharacterInfo />
            <Tabs defaultValue="stats" className="mt-4">
                <TabsList className="w-full flex justify-between">
                    <TabsTrigger value="stats">Stats</TabsTrigger>
                    <TabsTrigger value="skills">Skills</TabsTrigger>
                    <TabsTrigger value="features">Features</TabsTrigger>
                    <TabsTrigger value="spells">Spells</TabsTrigger>
                    <TabsTrigger value="equipment">Equipment</TabsTrigger>
                </TabsList>

                <TabsContent value="stats">
                    <StatsPanel />
                    <ResourcesPanel />
                </TabsContent>

                <TabsContent value="skills">
                    <div>Skills Section</div>
                </TabsContent>

                <TabsContent value="features">
                    <div>Features Section</div>
                </TabsContent>

                <TabsContent value="spells">
                    <div>Spells Section</div>
                </TabsContent>

                <TabsContent value="equipment">
                    <div>Equipment Section</div>
                </TabsContent>

            </Tabs>
        </div>
    );
}
