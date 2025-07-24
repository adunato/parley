import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Personality } from "@/lib/types";

interface CharacterTraitsDisplayProps {
  personality: Personality;
  likes: string[];
  dislikes: string[];
}

export function CharacterTraitsDisplay({ personality, likes, dislikes }: CharacterTraitsDisplayProps) {
  return (
    <Card className="w-[500px]">
      <CardHeader>
        <CardTitle>Character Traits</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <h3 className="text-lg font-semibold">Personality</h3>
          {Object.entries(personality).map(([trait, value]) => (
            <div key={trait} className="flex items-center gap-2">
              <span className="w-32 text-sm font-medium">{trait}:</span>
              <div className="relative flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`absolute h-full ${value >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{
                    width: `${Math.abs(value)}%`,
                    left: value >= 0 ? '0%' : `${50 - Math.abs(value) / 2}%`, // Adjust for negative values to center
                    right: value >= 0 ? 'auto' : `${50 - Math.abs(value) / 2}%`,
                    transform: value < 0 ? 'translateX(100%)' : 'none', // For negative values, start from the right
                    transformOrigin: value < 0 ? 'right' : 'left',
                  }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-800">
                  {value}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="grid gap-2">
          <h3 className="text-lg font-semibold">Preferences</h3>
          <div className="flex flex-wrap gap-2">
            {likes.map((pref) => (
              <Badge key={pref} className="bg-green-500 text-white">
                {pref}
              </Badge>
            ))}
            {dislikes.map((pref) => (
              <Badge key={pref} className="bg-red-500 text-white">
                {pref}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}