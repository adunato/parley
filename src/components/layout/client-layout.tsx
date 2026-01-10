"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { useParleyStore } from "@/lib/store";
import { ProjectService } from "@/lib/services/projectService";
import { cn } from "@/lib/utils";

export function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { theme } = useParleyStore();

    useEffect(() => {
        const root = window.document.documentElement;

        // Reset classes and attributes
        root.classList.remove("dark");
        root.removeAttribute("data-mode");

        if (theme === "dark") {
            root.classList.add("dark");
        } else if (theme === "demiplane-light") {
            root.setAttribute("data-mode", "demiplane-light");
        } else if (theme === "demiplane-dark") {
            root.setAttribute("data-mode", "demiplane-dark");
        }
    }, [theme]);

    useEffect(() => {
        ProjectService.checkForLegacyData().then((migrated) => {
            if (migrated) {
                window.location.reload();
            }
        });
    }, []);

    // Sidebar logic
    const isMainMenu = pathname === "/";
    const isWorldMap = pathname === "/world_map";
    const isChat = pathname === "/chat";
    const isLocationScreen = pathname?.startsWith("/location");

    // Only show sidebar if NOT in main game loop screens
    const showSidebar = !isMainMenu && !isWorldMap && !isChat && !isLocationScreen;

    return (
        <div className="flex min-h-screen">
            {showSidebar && <Sidebar />}
            <main className={cn(
                "flex-1 overflow-auto bg-background",
                (!isWorldMap && !isLocationScreen) && "p-6" // Remove padding for maps and immersive location screens
            )}>
                {children}
            </main>
        </div>
    );
}
