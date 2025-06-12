import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: 'Sobre - KDÊ',
};

export default function Page() {
  return (
    <Card className="w-full max-w-3xl bg-[var(--bg-simple)] shadow-md lg:max-w-5xl xl:max-w-6xl">
      <CardHeader className="pb-2 text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-xl font-bold text-[var(--font-color)] md:text-2xl lg:text-3xl">
          <Info className="h-6 w-6" />
          Sobre o Sistema
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-6 text-[var(--font-color)]">
        <p className="text-base md:text-lg">
          © 2025 Sistema de Gestão Patrimonial - KDE | Todos os direitos reservados.
          <br />
          KDÊ foi desenvolvido por <strong>Osiris Vinicius, Pedro Ernesto e Bruno Wagler</strong>.
        </p>

        <p className="text-base md:text-lg">
          <Link 
            href="https://preview.viniccius.com.br/" 
            target="_blank" 
            className="flex items-center gap-2 text-blue-500 hover:underline"
          >
            <Info size={20} className="text-blue-500" />
            kde@email.com
          </Link>
          <br />
          Este sistema foi desenvolvido com o objetivo de facilitar o processamento e gerenciamento de arquivos CSV e Excel,
          permitindo que os usuários façam upload, visualização e análise dos dados de forma prática.
        </p>

        <div className="flex justify-end border-t pt-4 lg:pt-6">
          <Button
            className="w-full bg-[var(--button-color)] px-8 py-6 text-[var(--font-color2)] transition-all hover:bg-[var(--hover-3-color)] hover:text-white sm:w-auto md:text-lg lg:text-xl cursor-pointer"
            asChild
          >
            <Link href="/admin">Voltar</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}