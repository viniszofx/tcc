import DarkModeToggle from "@/components/custom/dark-mode-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Acesso Negado - KDÊ",
};

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--bg-color)] p-4">
      <div className="absolute top-2 left-2 md:bottom-4 md:right-4 md:top-auto">
        <DarkModeToggle />
      </div>

      <Image
        className="mx-auto w-72 h-auto md:hidden mb-4"
        src="/logotipo.svg"
        alt="logo"
        width={288}
        height={100}
      />

      <Card className="w-full max-w-md bg-[var(--bg-simple)] shadow-lg border-[var(--border-color)]">
        <CardHeader className="text-center">
          <Image
            className="w-48 h-auto hidden md:block mb-4 mx-auto"
            src="/logotipo.svg"
            alt="logo"
            width={192}
            height={68}
          />

          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          <CardTitle className="text-2xl font-bold text-[var(--font-color)]">
            Acesso Negado
          </CardTitle>
        </CardHeader>

        <CardContent className="text-center space-y-4">
          <p className="text-[var(--font-color)]/70">
            Você não tem permissão para acessar este sistema.
          </p>

          <p className="text-sm text-[var(--font-color)]/60">
            Se você acredita que isto é um erro, entre em contato com o
            administrador do sistema para solicitar acesso.
          </p>

          <div className="pt-4">
            <Button asChild className="w-full">
              <Link href="/">Voltar ao Início</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
