import * as React from "react"
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, Moon, Sunset } from "lucide-react"
import { cn } from "@/lib/utils"

export type TimeOfDay = 'Morning' | 'Afternoon' | 'Evening' | 'Night'
export type Weather = 'Sunny' | 'Cloudy' | 'Rainy' | 'Snowy' | 'Stormy' | 'Clear'

export interface GameTimeDisplayProps extends React.HTMLAttributes<HTMLDivElement> {
    day: number
    timeOfDay: TimeOfDay
    weather: Weather
}

const getTimeIcon = (time: TimeOfDay, weather: Weather) => {
    // Weather takes precedence for precipitation/storm
    if (weather === 'Rainy') return CloudRain
    if (weather === 'Snowy') return CloudSnow
    if (weather === 'Stormy') return CloudLightning
    if (weather === 'Cloudy') return Cloud

    // For Clear/Sunny, use time-based icons
    switch (time) {
        case 'Morning':
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

const getStyles = (time: TimeOfDay, weather: Weather) => {
    // Base styles for time of day
    let styles = "bg-sky-400 text-yellow-100 border-sky-500" // Default/Morning

    switch (time) {
        case 'Afternoon':
            styles = "bg-sky-500 text-yellow-50 border-sky-600"
            break
        case 'Evening':
            styles = "bg-orange-400 text-orange-50 border-orange-500"
            break
        case 'Night':
            styles = "bg-indigo-950 text-indigo-100 border-indigo-900"
            break
    }

    // Weather overrides
    if (weather === 'Rainy') styles = "bg-blue-700 text-blue-100 border-blue-800"
    if (weather === 'Stormy') styles = "bg-slate-700 text-yellow-100 border-slate-800"
    if (weather === 'Snowy') styles = "bg-slate-200 text-slate-600 border-slate-300"
    if (weather === 'Cloudy') styles = "bg-slate-400 text-slate-100 border-slate-500"

    return styles
}

export function GameTimeDisplay({
    day,
    timeOfDay,
    weather,
    className,
    ...props
}: GameTimeDisplayProps) {
    const Icon = getTimeIcon(timeOfDay, weather)
    const colorClass = getStyles(timeOfDay, weather)

    return (
        <div
            className={cn(
                "inline-flex items-center relative",
                className
            )}
            {...props}
        >
            {/* Day Container */}
            <div className="flex items-center justify-center bg-white border-2 border-slate-400 rounded-lg pl-6 pr-14 py-2 min-w-[160px] shadow-sm z-10">
                <span className="text-xl font-display font-semibold text-slate-900 tracking-tight">
                    Day {day} {timeOfDay}
                </span>
            </div>

            {/* Weather/Time Icon Badge */}
            <div className={cn(
                "absolute -right-6 flex items-center justify-center w-14 h-14 rounded-full border-4 shadow-md z-20",
                colorClass
            )}>
                <Icon className="w-8 h-8" strokeWidth={2.5} />
            </div>
        </div>
    )
}
