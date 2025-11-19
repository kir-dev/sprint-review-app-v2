import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function ProfileLoading() {
  return (
    <div className="flex flex-col gap-6 p-8 max-w-7xl mx-auto animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-muted" />
        <div className="space-y-2">
          <div className="h-8 w-48 rounded-md bg-muted" />
          <div className="h-4 w-64 rounded-md bg-muted" />
        </div>
      </div>

      {/* Profile Picture Card */}
      <Card>
        <CardHeader>
          <div className="h-6 w-32 rounded-md bg-muted" />
          <div className="h-4 w-48 rounded-md bg-muted" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-10 w-32 rounded-md bg-muted" />
              <div className="h-3 w-40 rounded-md bg-muted" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Information Card */}
      <Card>
        <CardHeader>
          <div className="h-6 w-40 rounded-md bg-muted" />
          <div className="h-4 w-56 rounded-md bg-muted" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="h-4 w-20 rounded-md bg-muted" />
              <div className="h-10 w-full rounded-md bg-muted" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-20 rounded-md bg-muted" />
              <div className="h-10 w-full rounded-md bg-muted" />
            </div>
          </div>
          <div className="space-y-2 pt-2 border-t">
            <div className="h-4 w-20 rounded-md bg-muted" />
            <div className="h-8 w-24 rounded-md bg-muted" />
          </div>
        </CardContent>
      </Card>

      {/* Additional Information Card */}
      <Card>
        <CardHeader>
          <div className="h-6 w-48 rounded-md bg-muted" />
          <div className="h-4 w-52 rounded-md bg-muted" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="h-4 w-24 rounded-md bg-muted" />
            <div className="h-10 w-full rounded-md bg-muted" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-32 rounded-md bg-muted" />
            <div className="flex gap-2">
              <div className="h-10 w-full rounded-md bg-muted" />
              <div className="h-10 w-24 rounded-md bg-muted" />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <div className="h-10 w-20 rounded-md bg-muted" />
            <div className="h-10 w-32 rounded-md bg-muted" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
