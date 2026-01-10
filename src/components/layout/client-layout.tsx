"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { useParleyStore } from "@/lib/store";
import { ProjectService } from "@/lib/services/projectService";
import { cn } from "@/lib/utils";

export function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { theme, appState } = useParleyStore();

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
    // Sidebar logic: Only show if we are explicitly in Configuration mode
    const showSidebar = appState === 'configuration';

    return (
        <div className="flex min-h-screen">
            {showSidebar && <Sidebar />}
            <main className={cn(
                "flex-1 overflow-auto bg-background",
                appState === 'configuration' && "p-6" // Only add padding if in Configuration mode
            )}>
                {children}
            </main>
        </div>
    );
}
