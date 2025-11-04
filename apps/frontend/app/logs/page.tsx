"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface Log {
  id: string
  category: string
  date: string
  hours: number
  description: string
  projectId?: string
  workPeriodId: string
}

export default function LogsPage() {
  const { user, token } = useAuth()
  const router = useRouter()
  const [logs, setLogs] = useState<Log[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      router.push('/login')
      return
    }
    loadLogs()
  }, [token, router])

  async function loadLogs() {
    try {
      setIsLoading(true)
      const response = await fetch('/api/logs', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setLogs(data)
        setError(null)
      } else {
        setError('Failed to load logs')
      }
    } catch (err) {
      setError('Failed to load logs. Please check if the backend is running.')
      console.error('Error loading logs:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Work Logs</h1>
          <p className="text-muted-foreground">Track your work hours and activities</p>
        </div>
        <Button>New Log</Button>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Your Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading logs...</p>
          ) : logs.length === 0 ? (
            <p className="text-muted-foreground">No logs found. Create your first log to get started!</p>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{log.category}</h3>
                      <p className="text-sm text-muted-foreground">{log.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {log.date} • {log.hours} hours
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
