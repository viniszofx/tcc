import { AlertCircle } from "lucide-react"

interface ErrorDisplayProps {
  type: "error" | "warning"
  title: string
  message: string
  suggestion?: string
}

export default function ErrorDisplay({ type, title, message, suggestion }: ErrorDisplayProps) {
  const styles = {
    error: {
      bg: "bg-red-50 dark:bg-red-900/20",
      icon: "text-red-600 dark:text-red-400",
      iconBg: "bg-red-100 dark:bg-red-800/30",
      title: "text-red-800 dark:text-red-200",
      message: "text-red-700 dark:text-red-300",
      border: "border-red-100 dark:border-red-800/30",
      footerBg: "bg-red-50/50 dark:bg-red-900/10",
    },
    warning: {
      bg: "bg-amber-50 dark:bg-amber-900/20",
      icon: "text-amber-600 dark:text-amber-400",
      iconBg: "bg-amber-100 dark:bg-amber-800/30",
      title: "text-amber-800 dark:text-amber-200",
      message: "text-amber-700 dark:text-amber-300",
      border: "border-amber-100 dark:border-amber-800/30",
      footerBg: "bg-amber-50/50 dark:bg-amber-900/10",
    },
  }

  const style = styles[type]

  return (
    <div className={`mt-4 overflow-hidden rounded-xl ${style.bg} shadow-md`}>
      <div className="flex items-start gap-3 p-4">
        <div className={`rounded-full ${style.iconBg} p-2`}>
          <AlertCircle className={`h-5 w-5 ${style.icon}`} />
        </div>
        <div>
          <p className={`font-medium ${style.title}`}>{title}</p>
          <p className={`mt-1 text-sm ${style.message}`}>{message}</p>
        </div>
      </div>
      {suggestion && (
        <div className={`border-t ${style.border} ${style.footerBg} px-4 py-3`}>
          <p className={`text-xs ${style.message}`}>{suggestion}</p>
        </div>
      )}
    </div>
  )
}