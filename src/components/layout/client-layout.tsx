"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { useParleyStore } from "@/lib/store";

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

    // Sidebar logic
    const isMainMenu = pathname === "/";
    const showSidebar = !isMainMenu;

    return (
        <div className="flex min-h-screen">
            {showSidebar && <Sidebar />}
            <main className="flex-1 overflow-auto bg-background p-6">
                {children}
            </main>
        </div>
    );
}
