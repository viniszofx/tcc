import { Card, CardContent } from "@/components/ui/card"

export default function Loading() {
  return (
    <Card className="w-full max-w-3xl bg-[var(--bg-simple)] shadow-md lg:max-w-5xl xl:max-w-6xl mx-auto">
      <CardContent className="p-8 flex justify-center items-center">
        <div className="animate-pulse flex flex-col gap-4 w-full">
          <div className="h-8 bg-[var(--card-color)] rounded w-1/3"></div>
          <div className="h-6 bg-[var(--card-color)] rounded w-full"></div>
          <div className="h-40 bg-[var(--card-color)] rounded w-full"></div>
          <div className="h-40 bg-[var(--card-color)] rounded w-full"></div>
        </div>
      </CardContent>
    </Card>
  )
}