import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex-1 w-full p-3 xs:p-4 sm:p-5 md:p-6 lg:p-8 flex items-center justify-center">
      <Card className="bg-[var(--bg-simple)] w-full max-w-[98%] xs:max-w-[95%] sm:max-w-[90%] md:max-w-[85%] lg:max-w-[calc(100%-var(--sidebar-width)-2rem)] mx-auto shadow-md rounded-lg flex flex-col h-full md:h-auto flex-grow">
        <div className="flex flex-col md:flex-row h-full p-6 sm:p-8 gap-8">
          <div className="w-full md:w-1/3 flex flex-col space-y-6">
            <div className="flex flex-col items-center space-y-4 bg-[var(--bg-simple)] rounded-lg p-4 border border-[var(--border-color)] shadow-sm">
              <Skeleton className="h-6 w-24 rounded-md" />
              <Skeleton className="h-24 w-24 rounded-full" />
              <Skeleton className="h-5 w-32 rounded-md" />
              <Skeleton className="h-4 w-40 rounded-md" />
            </div>

            <div className="bg-[var(--bg-simple)] rounded-lg p-4 border border-[var(--border-color)] shadow-sm">
              <Skeleton className="h-5 w-24 mb-3 rounded-md" />
              <Skeleton className="h-24 w-full rounded-md" />
            </div>

            <div className="bg-[var(--bg-simple)] rounded-lg p-4 border border-[var(--border-color)] shadow-sm">
              <Skeleton className="h-5 w-24 mb-3 rounded-md" />
              <Skeleton className="h-5 w-32 rounded-md" />
            </div>
          </div>

          <div className="hidden md:block w-px bg-border h-auto" />

          <div className="w-full md:w-2/3">
            <div className="bg-[var(--bg-simple)] rounded-lg p-6 border border-[var(--border-color)] shadow-sm h-auto md:h-full">
              <Skeleton className="h-7 w-32 mb-6 rounded-md" />
              <div className="space-y-6">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-24 rounded-md" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-5 w-24 rounded-md" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-5 w-24 rounded-md" />
                  <Skeleton className="h-24 w-full rounded-md" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full px-6 sm:px-8 py-4 md:py-5 border-t flex flex-row justify-end gap-6 sm:gap-4">
          <Skeleton className="w-[45%] xs:w-[160px] sm:w-[180px] md:w-[200px] h-10 xs:h-11 rounded-md" />
          <Skeleton className="w-[45%] xs:w-[160px] sm:w-[180px] md:w-[200px] h-10 xs:h-11 rounded-md" />
        </div>
      </Card>
    </div>
  )
}