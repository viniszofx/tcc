import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function Page() {
  return (
    <Card className="w-full max-w-3xl bg-[var(--bg-simple)] shadow-md lg:max-w-5xl xl:max-w-6xl">
      <CardHeader className="pb-2 text-center">
        <CardTitle className="text-xl font-bold text-[var(--font-color)] md:text-2xl lg:text-3xl">
          Sobre o Sistema
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-6 text-[var(--font-color)]">
        <p className="text-base md:text-lg">
          Este sistema foi desenvolvido com o objetivo de facilitar o processamento e gerenciamento de arquivos CSV e Excel,
          permitindo que os usuários façam upload, visualização e análise dos dados de forma prática e intuitiva.
        </p>

        <p className="text-base md:text-lg">
          Além disso, conta com funcionalidades como aceleração de hardware e interface responsiva para garantir um desempenho
          otimizado em diferentes dispositivos.
        </p>

        <p className="text-base md:text-lg">
          Desenvolvido por <strong>João Silva</strong>, este projeto visa proporcionar uma experiência moderna, segura e eficiente.
        </p>

        <div className="flex justify-end border-t pt-4 lg:pt-6">
          <Button
            className="w-full bg-[var(--button-color)] px-8 py-6 text-[var(--font-color2)] transition-all hover:bg-[var(--hover-3-color)] hover:text-white sm:w-auto md:text-lg lg:text-xl cursor-pointer"
            asChild
          >
            <Link href="/dashboard">Voltar</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}