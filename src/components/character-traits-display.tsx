import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SectionHeader } from "@/components/ui/section-header";
import { Personality } from "@/lib/types";

interface CharacterTraitsDisplayProps {
  personality: Personality;
  idealMatch?: Personality;
  showIdealMatch?: boolean;
  showHeading?: boolean;
}

export function CharacterTraitsDisplay({ personality, idealMatch, showIdealMatch = true, showHeading = true }: CharacterTraitsDisplayProps) {
  return (
    <Card className="w-full border-border shadow-sm">
      {showHeading && (
        <CardHeader className="pb-2">
          <CardTitle className="type-h4">Character Traits</CardTitle>
        </CardHeader>
      )}
      <CardContent className={`grid gap-6 ${showHeading ? '' : 'pt-6'}`}>
        <div className="grid gap-4">
          <h3 className="type-ui-subhead text-muted-foreground border-b border-border pb-2 text-center sm:text-left">PERSONALITY</h3>
          {Object.entries(personality).map(([trait, value]) => (
            <div key={trait} className="flex items-center gap-2">
              <span className="w-24 sm:w-32 type-ui-label text-foreground text-[10px] sm:text-xs truncate">{trait.toUpperCase()}:</span>
              <div className="relative flex-1 h-3 bg-muted rounded-full overflow-hidden border border-border/50">
                <div
                  className={`absolute h-full ${value >= 0 ? 'bg-green-600' : 'bg-destructive'}`}
                  style={{
                    width: `${Math.abs(value)}%`,
                    left: value >= 0 ? '0%' : `${50 - Math.abs(value) / 2}%`, // Adjust for negative values to center
                    right: value >= 0 ? 'auto' : `${50 - Math.abs(value) / 2}%`,
                    transform: value < 0 ? 'translateX(100%)' : 'none', // For negative values, start from the right
                    transformOrigin: value < 0 ? 'right' : 'left',
                  }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-foreground/80">
                  {Math.round(value / 10)}
                </div>
              </div>
            </div>
          ))}
        </div>
        {showIdealMatch && idealMatch && (
          <div className="grid gap-4">
            <h3 className="type-ui-subhead text-muted-foreground border-b border-border pb-2 text-center sm:text-left">IDEAL MATCH</h3>
            {Object.entries(idealMatch).map(([trait, value]) => (
              <div key={trait} className="flex items-center gap-2">
                <span className="w-24 sm:w-32 type-ui-label text-foreground text-[10px] sm:text-xs truncate">{trait.toUpperCase()}:</span>
                <div className="relative flex-1 h-3 bg-muted rounded-full overflow-hidden border border-border/50">
                  <div
                    className="absolute h-full bg-primary"
                    style={{
                      width: `${Math.abs(value)}%`,
                      left: '0',
                    }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-foreground/80">
                    {Math.round(value / 10)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}