import * as React from "react"
import { cn } from "@/lib/utils"
import { Settings, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { GameTimeDisplay, TimeOfDay } from "@/components/ui/game-time-display"

export interface GameplayToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
    currentDay: number
    timeOfDay: TimeOfDay
    personaName?: string
    personaImageSrc?: string
    onOpenSettings?: () => void
    onExitGame?: () => void
}

export function GameplayToolbar({
    currentDay,
    timeOfDay,
    personaName,
    personaImageSrc,
    onOpenSettings,
    onExitGame,
    className,
    ...props
}: GameplayToolbarProps) {
    return (
        <header
            className={cn(
                "w-full h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 flex items-center justify-between z-50 sticky top-0 shadow-sm",
                className
            )}
            {...props}
        >
            {/* Left: Persona */}
            <div className="flex items-center gap-3 w-1/3">
                <Avatar className="h-10 w-10 border border-border shadow-sm">
                    <AvatarImage src={personaImageSrc} alt={personaName || "Player"} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                        <User className="w-5 h-5" />
                    </AvatarFallback>
                </Avatar>
                {personaName && (
                    <span className="text-sm font-medium hidden sm:inline-block text-foreground/90 truncate max-w-[150px]">
                        {personaName}
                    </span>
                )}
            </div>

            {/* Center: Time Widget */}
            <div className="flex justify-center w-1/3">
                <GameTimeDisplay
                    day={currentDay}
                    timeOfDay={timeOfDay}
                />
            </div>

            {/* Right: Actions */}
            <div className="flex items-center justify-end gap-2 w-1/3">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onOpenSettings}
                    className="text-muted-foreground hover:text-foreground"
                    title="Settings"
                >
                    <Settings className="w-5 h-5" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onExitGame}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    title="Exit to Menu"
                >
                    <LogOut className="w-5 h-5" />
                </Button>
            </div>
        </header>
    )
}
