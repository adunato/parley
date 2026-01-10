import * as React from "react"
import { Sun, Moon, Sunset, Sunrise } from "lucide-react"
import { cn } from "@/lib/utils"

export type TimeOfDay = 'Morning' | 'Afternoon' | 'Evening' | 'Night'
// Keeping Weather type for prop compatibility if needed upstream, but not using it for visual logic per request
export type Weather = 'Sunny' | 'Cloudy' | 'Rainy' | 'Snowy' | 'Stormy' | 'Clear'

export interface GameTimeDisplayProps extends React.HTMLAttributes<HTMLDivElement> {
    day: number
    timeOfDay: TimeOfDay
    weather?: Weather // Made optional as we might not need it for display anymore
}

const getTimeIcon = (time: TimeOfDay) => {
    switch (time) {
        case 'Morning':
            return Sunrise
        case 'Afternoon':
            return Sun
        case 'Evening':
            return Sunset
        case 'Night':
            return Moon
        default:
            return Sun
    }
}

const getStyles = (time: TimeOfDay) => {
    switch (time) {
        case 'Morning':
            return "bg-sky-300 text-yellow-50 border-sky-400"
        case 'Afternoon':
            return "bg-sky-500 text-yellow-100 border-sky-600"
        case 'Evening':
            return "bg-orange-400 text-orange-50 border-orange-500"
        case 'Night':
            return "bg-indigo-950 text-indigo-100 border-indigo-900"
        default:
            return "bg-sky-400 text-yellow-100 border-sky-500"
    }
}

export function GameTimeDisplay({
    day,
    timeOfDay,
    weather,
    className,
    ...props
}: GameTimeDisplayProps) {
    const Icon = getTimeIcon(timeOfDay)
    const colorClass = getStyles(timeOfDay)

    return (
        <div
            className={cn(
                "inline-flex items-center relative gap-2",
                className
            )}
            {...props}
        >
             {/* Weather/Time Icon Badge */}
             <div className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full border-2 shadow-sm z-20",
                colorClass
            )}>
                <Icon className="w-5 h-5" strokeWidth={2.5} />
            </div>

            {/* Day Text */}
            <div className="flex items-center justify-center bg-background/80 backdrop-blur-sm border border-border rounded-md px-3 py-1 shadow-sm">
                <span className="text-sm font-display font-semibold text-foreground tracking-wide whitespace-nowrap">
                    Day {day}
                    <span className="hidden sm:inline-block ml-1 opacity-70 text-xs font-normal uppercase tracking-wider">
                        {timeOfDay}
                    </span>
                </span>
            </div>
        </div>
    )
}
