import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex-1 w-full p-3 xs:p-4 sm:p-5 md:p-6 lg:p-8 flex items-center justify-center">
      <Card className="bg-[var(--bg-simple)] w-full max-w-[98%] xs:max-w-[95%] sm:max-w-[90%] md:max-w-[85%] lg:max-w-[calc(100%-var(--sidebar-width)-2rem)] mx-auto shadow-md rounded-lg">
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <h2 className="text-2xl font-bold text-[var(--font-color)] mb-4">Perfil não encontrado</h2>
          <p className="text-[var(--font-color)]/70 mb-6">
            O perfil que você está procurando não existe ou foi removido.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center pb-8">
          <Button
            className="bg-[var(--button-color)] text-[var(--font-color2)] hover:bg-[var(--hover-3-color)]"
            asChild
          >
            <Link href="/dashboard">Voltar para o Dashboard</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
