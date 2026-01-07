import * as React from "react"
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, Moon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface GameTimeDisplayProps extends React.HTMLAttributes<HTMLDivElement> {
    day: number
    weather: 'Sunny' | 'Cloudy' | 'Rainy' | 'Snowy' | 'Stormy' | 'Clear Night'
}

const weatherIcons = {
    'Sunny': Sun,
    'Cloudy': Cloud,
    'Rainy': CloudRain,
    'Snowy': CloudSnow,
    'Stormy': CloudLightning,
    'Clear Night': Moon,
}

const weatherColors = {
    'Sunny': "bg-sky-400 text-yellow-100 border-sky-500",
    'Cloudy': "bg-slate-400 text-slate-100 border-slate-500",
    'Rainy': "bg-blue-600 text-blue-100 border-blue-700",
    'Snowy': "bg-slate-200 text-slate-600 border-slate-300",
    'Stormy': "bg-indigo-600 text-indigo-100 border-indigo-700",
    'Clear Night': "bg-indigo-950 text-indigo-100 border-indigo-900",
}

export function GameTimeDisplay({
    day,
    weather,
    className,
    ...props
}: GameTimeDisplayProps) {
    const Icon = weatherIcons[weather] || Sun
    const colorClass = weatherColors[weather] || weatherColors['Sunny']

    return (
        <div
            className={cn(
                "inline-flex items-center relative",
                className
            )}
            {...props}
        >
            {/* Day Container */}
            <div className="flex items-center justify-center bg-white border-2 border-slate-400 rounded-lg pl-6 pr-14 py-2 min-w-[140px] shadow-sm z-10">
                <span className="text-xl font-display font-semibold text-slate-900 tracking-tight">
                    Day {day} {weather === 'Sunny' ? 'Sun' : ''}
                </span>
            </div>

            {/* Weather Icon Badge */}
            <div className={cn(
                "absolute -right-6 flex items-center justify-center w-14 h-14 rounded-full border-4 shadow-md z-20",
                colorClass
            )}>
                <Icon className="w-8 h-8" strokeWidth={2.5} />
            </div>
        </div>
    )
}
