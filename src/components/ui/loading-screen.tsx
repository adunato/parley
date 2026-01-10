"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function LoadingScreen({ className }: { className?: string }) {
    return (
        <div className={cn("flex flex-col items-center justify-center min-h-screen bg-background text-foreground z-50", className)}>
            <div className="flex flex-col items-center space-y-8 animate-pulse">
                <div className="space-y-4 text-center">
                    <h1 className="text-6xl md:text-8xl font-medium tracking-tighter font-display text-transparent bg-clip-text bg-gradient-to-b from-foreground to-muted-foreground uppercase">
                        PARLEY
                    </h1>
                    <p className="text-sm text-muted-foreground font-sans tracking-[0.2em] uppercase font-bold">
                        Interactive Fiction Engine
                    </p>
                </div>
                <div className="h-1 w-12 bg-primary/20 overflow-hidden rounded-full">
                    <div className="h-full bg-primary w-full animate-[loading_1.5s_ease-in-out_infinite] -translate-x-full" />
                </div>
            </div>
            <style jsx global>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
        </div>
    );
}
