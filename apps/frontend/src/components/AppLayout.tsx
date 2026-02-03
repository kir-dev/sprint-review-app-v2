"use client"

import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { usePathname } from "next/navigation"
import React from "react"
import { Sidebar } from "./sidebar"

// Pages that should NOT show the sidebar
const pagesWithoutSidebar = ["/login"]

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const showSidebar = !pagesWithoutSidebar.includes(pathname)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  if (!showSidebar) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen overflow-hidden">
        {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

        {/* Mobile Sidebar */}
        <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetContent side="left" className="p-0 w-80">
                     <Sidebar className="w-full h-full border-none" onClose={() => setIsMobileMenuOpen(false)} />
                </SheetContent>
            </Sheet>
        </div>

      <main className="flex-1 overflow-y-auto bg-background flex flex-col">
         {/* Mobile Header */}
         <div className="md:hidden p-4 border-b flex items-center gap-4 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 rounded-md hover:bg-accent">
                <Menu className="h-6 w-6" />
            </button>
            <span className="font-semibold">Sprint Review</span>
         </div>
        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  )
}
