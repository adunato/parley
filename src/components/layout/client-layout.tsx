"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";

export function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Sidebar is hidden on Main Menu ("/") and Chat ("/chat")? 
    // User Requirement: "Left sidebar should be hidden and only visible when we are in 'Configuration' mode"
    // "For now only 'Configuration' works and will display the sidebar to the left."
    // So I'll hide it on "/" and show it everywhere else for now?
    // Let's assume "/" is the Main Menu.

    const isMainMenu = pathname === "/";
    // const isChat = pathname === "/chat"; 
    // Should chat have sidebar? Usually no, it needs full screen. 
    // But for now, "Configuration" links to /settings etc.

    // Let's say we hide on Main Menu. 
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
