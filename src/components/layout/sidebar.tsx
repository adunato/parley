"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Settings,
  Users,
  UsersRound,
  UserCog,
  Globe,
  MapPin,
  Home,
  MessageSquare,
  Dna
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  const links = [
    { href: "/settings", label: "Settings", icon: Settings },
    { href: "/character-config", label: "Characters", icon: Users },
    { href: "/character-group-config", label: "Character Groups", icon: UsersRound },
    { href: "/persona-config", label: "Personas", icon: UserCog },
    { href: "/world-info", label: "World Info", icon: Globe },
    { href: "/locations", label: "Locations", icon: MapPin },
    { href: "/bio-config", label: "Bio Generator", icon: Dna },
    // Keeping Chat for dev convenience, though not strictly "configuration"
    { href: "/chat", label: "Chat", icon: MessageSquare },
  ];

  return (
    <div className={cn("hidden md:flex flex-col w-64 h-screen bg-background border-r border-border", className)}>
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-medium text-primary tracking-tight font-display uppercase">PARLEY</h2>
        <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest font-bold">Configuration</p>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-sm transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary border-r-2 border-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <Icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground")} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-sm transition-colors"
        >
          <Home className="w-4 h-4 text-muted-foreground" />
          Main Menu
        </Link>
      </div>
    </div>
  );
}
