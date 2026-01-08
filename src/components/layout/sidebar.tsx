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
  MessageSquare
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
     // Keeping Chat for dev convenience, though not strictly "configuration"
    { href: "/chat", label: "Chat", icon: MessageSquare },
  ];

  return (
    <div className={cn("hidden md:flex flex-col w-64 h-screen bg-gray-900 border-r border-gray-800", className)}>
      <div className="p-6">
        <h2 className="text-xl font-bold text-white tracking-wider font-cinzel">PARLEY</h2>
        <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">Configuration</p>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-primary/20 text-primary hover:bg-primary/30"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              )}
            >
              <Icon className="w-5 h-5" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
        >
          <Home className="w-5 h-5" />
          Main Menu
        </Link>
      </div>
    </div>
  );
}
