import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";


export default function page() {
  return (
    <div>
      <Card className="w-full max-w-3xl bg-[var(--bg-simple)] shadow-lg transition-all duration-300 lg:max-w-5xl xl:max-w-6xl">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
          <div>
            <CardTitle className="text-xl font-bold text-[var(--font-color)] md:text-2xl lg:text-3xl">
              Membros da Comissão
            </CardTitle>
            <CardDescription className="text-[var(--font-color)]">
              Aqui você pode gerenciar os membros da comissão.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Conteúdo dos membros da comissão */}
          <p>Lista de membros será exibida aqui.</p>
        </CardContent>

        <CardFooter className="flex justify-end">
          {/* Botões de ação, se necessário */}
        </CardFooter>
      </Card>
    </div>
  )
}
