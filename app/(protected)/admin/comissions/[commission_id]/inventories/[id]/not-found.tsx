import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FileQuestion } from "lucide-react"
import Link from "next/link"

export default function NotFound() {
  return (
    <Card className="w-full max-w-md bg-[var(--bg-simple)] shadow-md text-center mx-auto">
      <CardHeader className="pb-2">
        <div className="flex justify-center mb-4">
          <FileQuestion className="h-16 w-16 text-[var(--font-color)]/50" />
        </div>
        <CardTitle className="text-xl font-bold text-[var(--font-color)] md:text-2xl">Item não encontrado</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-[var(--font-color)]/70">
          O item de inventário que você está procurando não foi encontrado ou pode ter sido removido.
        </p>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Link href="/admin">
          <Button className="bg-[var(--button-color)] text-[var(--font-color2)] hover:bg-[var(--hover-2-color)] hover:text-white cursor-pointer">
            Voltar para Inventário
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
