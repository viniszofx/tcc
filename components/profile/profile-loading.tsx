import { Card } from "@/components/ui/card"

export default function ProfileLoading() {
  return (
    <div className="flex-1 w-full p-3 xs:p-4 sm:p-5 md:p-6 lg:p-8 flex items-center justify-center">
      <Card className="bg-[var(--bg-simple)] w-full max-w-[98%] xs:max-w-[95%] sm:max-w-[90%] md:max-w-[85%] lg:max-w-[calc(100%-var(--sidebar-width)-2rem)] mx-auto shadow-md rounded-lg p-8">
        <div className="flex items-center justify-center">
          <p className="text-[var(--font-color)]">Carregando perfil...</p>
        </div>
      </Card>
    </div>
  )
}
