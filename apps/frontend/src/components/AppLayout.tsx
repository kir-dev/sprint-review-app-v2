"use client"

import { usePathname } from "next/navigation"
import type React from "react"
import { Sidebar } from "./Sidebar"

// Pages that should NOT show the sidebar
const pagesWithoutSidebar = ["/login"]

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const showSidebar = !pagesWithoutSidebar.includes(pathname)

  if (!showSidebar) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
