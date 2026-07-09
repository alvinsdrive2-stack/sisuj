import { LucideIcon, Inbox } from "lucide-react"
import { Button } from "./button"
import { ReactNode } from "react"

interface EmptyStateProps {
  icon?: LucideIcon
  title?: string
  message?: string
  action?: {
    label: string
    onClick: () => void
  }
  children?: ReactNode
}

export function EmptyState({
  icon: Icon = Inbox,
  title = "Tidak ada data",
  message,
  action,
  children,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-slate-400 dark:text-slate-500" />
      </div>
      <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">
        {title}
      </h3>
      {message && (
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-sm mb-4">
          {message}
        </p>
      )}
      {action && (
        <Button variant="outline" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
      {children}
    </div>
  )
}
