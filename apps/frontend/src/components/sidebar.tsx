"use client"

import { useTheme } from "@/components/ThemeProvider"
import { ThemeToggle } from "@/components/ThemeToggle"
import { useAuth } from "@/context/AuthContext"
import { cn } from "@/lib/utils"
import { BarChart3, CalendarDays, ChevronLeft, ChevronRight, FileText, FolderKanban, LayoutDashboard, Users } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Projektek", href: "/projects", icon: FolderKanban },
  { name: "Események", href: "/events", icon: CalendarDays },
  { name: "Felhasználók", href: "/users", icon: Users },
  { name: "Logok", href: "/logs", icon: FileText },
  { name: "Statisztika", href: "/statistics", icon: BarChart3 },
]

export function Sidebar({ className, onClose }: { className?: string; onClose?: () => void }) {
  const pathname = usePathname()
  const { user } = useAuth()
  const { theme } = useTheme()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const logoSrc = theme === "light" ? "/Kir-Dev-Black.png" : "/Kir-Dev-White.png"

  const handleLinkClick = () => {
    if (onClose) {
      onClose()
    }
  }

  return (
    <div className={cn(
      "flex h-full flex-col border-r border-border bg-card animate-slide-in-left transition-all duration-300",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Logo */}
      <div className={cn(
        "flex h-16 items-center gap-2 border-b border-border animate-fade-in relative",
        isCollapsed ? "px-2" : "px-6"
      )}>
        {!isCollapsed && (
          <>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg transition-transform">
              <img src={logoSrc} alt="kir-dev" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold leading-none">Sprint Review</span>
              <span className="text-xs text-muted-foreground">Kir-Dev</span>
            </div>
          </>
        )}
        {isCollapsed && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg transition-all mx-auto">
            <img src={logoSrc} alt="kir-dev" className="w-full h-full object-contain" />
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full border border-border bg-card hover:bg-accent transition-colors flex items-center justify-center",
            "shadow-md hover:shadow-lg",
            // Hide collapse button on mobile/sheet view if needed, or keeping it is fine.
            // But if className includes w-full (mobile), collapsing might not be desired.
            // For now keeping it simple.
             className?.includes("w-full") && "hidden"
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item, index) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={handleLinkClick}
              style={{ animationDelay: `${index * 50}ms` }}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all animate-fade-in",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md hover:shadow-lg"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
                isCollapsed && "justify-center px-2",
                isCollapsed && !isActive && "hover:scale-110",
                !isCollapsed && !isActive && "hover:translate-x-1"
              )}
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon className={cn(
                "transition-transform",
                isCollapsed ? "h-5 w-5" : "h-4 w-4",
                isActive && "animate-pulse-slow"
              )} />
              {!isCollapsed && item.name}
            </Link>
          )
        })}
      </nav>

      {/* Footer with user info and theme toggle */}
      <div className="border-t border-border p-4 animate-slide-in-bottom">
        <div className={cn(
          "flex items-center gap-2 rounded-lg p-2 transition-all",
          isCollapsed ? "flex-col" : "group"
        )}>
          <Link 
            href="/profile"
            onClick={handleLinkClick}
            className={cn(
              "flex items-center gap-2 flex-1 min-w-0 rounded-lg transition-all hover:bg-accent/50 p-2 -m-2",
              isCollapsed && "flex-col"
            )}
            title={isCollapsed ? "Profil" : undefined}
          >
            <div className={cn(
              "rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden",
              isCollapsed ? "h-10 w-10" : "h-8 w-8"
            )}>
              {user?.profileImage ? (
                <img src={user.profileImage} alt={user.fullName} className="w-full h-full object-cover" />
              ) : (
                <span className={cn(
                  "font-semibold text-primary",
                  isCollapsed ? "text-sm" : "text-xs"
                )}>
                  {user?.fullName?.charAt(0).toUpperCase() || "U"}
                </span>
              )}
            </div>
            {!isCollapsed && (
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm font-medium leading-none truncate">
                  {user?.fullName || "User"}
                </span>

              </div>
            )}
          </Link>
          <div className={cn(
            "shrink-0 rounded-lg p-2 -m-2 transition-colors hover:bg-accent/50",
            isCollapsed && "mt-2"
          )}>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  )
}
