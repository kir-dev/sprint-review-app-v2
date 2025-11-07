interface ErrorAlertProps {
  error: string | null
  onClose: () => void
}

export function ErrorAlert({ error, onClose }: ErrorAlertProps) {
  if (!error) return null

  return (
    <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg flex items-center justify-between animate-slide-in-top">
      <p className="text-sm">{error}</p>
      <button
        onClick={onClose}
        className="text-destructive hover:text-destructive/80 transition-colors"
      >
        ✕
      </button>
    </div>
  )
}
