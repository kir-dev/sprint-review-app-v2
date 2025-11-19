"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LogOut } from "lucide-react"

interface LogoutCardProps {
  onLogout: () => void
}

export function LogoutCard({ onLogout }: LogoutCardProps) {
  return (
    <Card className="animate-slide-in-bottom hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle>Sign Out</CardTitle>
        <CardDescription>
          Sign out from your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant="destructive"
          onClick={onLogout}
          className="w-full gap-2 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </CardContent>
    </Card>
  )
}
