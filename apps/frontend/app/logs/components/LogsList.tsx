import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { Log } from "../types"
import { LogItem } from "./LogItem"

interface LogsListProps {
  logs: Log[]
  isLoading: boolean
  onCreateLog: () => void
  onEditLog: (log: Log) => void
  onDeleteLog: (id: number) => void
}

export function LogsList({
  logs,
  isLoading,
  onCreateLog,
  onEditLog,
  onDeleteLog,
}: LogsListProps) {
  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>Bejegyzéseid</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-center mt-4 text-muted-foreground animate-pulse">Bejegyzések betöltése...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 animate-fade-in">
            <p className="text-muted-foreground mb-4">
              Nincs bejegyzés. Készítsd el az elsőt!
            </p>
            <Button 
              onClick={onCreateLog}
              className="transition-all hover:scale-105"
            >
              <Plus className="h-4 w-4 mr-2" />
              Első Bejegyzés Létrehozása
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log, index) => (
              <div
                key={log.id}
                style={{ animationDelay: `${index * 50}ms` }}
                className="animate-slide-in-left"
              >
                <LogItem
                  log={log}
                  onEdit={onEditLog}
                  onDelete={onDeleteLog}
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}