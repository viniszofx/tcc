import DarkModeToggle from "@/app/custom/dark-mode-toggle"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "Verificar e-mail - KDÊ",
}

export default function EmailCheck({
  searchParams,
}: {
  searchParams?: { email?: string }
} = {}) {
  const email = searchParams?.email || "seu endereço de e-mail"

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4">
      <div className="absolute top-2 left-2 md:bottom-4 md:right-4 md:top-auto">
        <DarkModeToggle />
      </div>
      <img className="mx-auto w-72 h-auto md:hidden" src="/e-mail.svg" alt="logo" />
      <Card className="mx-auto max-w-4xl w-full mt-4 max-h-full md:p-8 border-[var(--border-color)] bg-[var(--bg-simple)]">
        <CardHeader className="flex flex-col items-start md:items-center text-left md:text-center">
          <img className="w-88 h-auto hidden md:block mb-6" src="/e-mail.svg" alt="logo" />
          <CardTitle className="md:text-4xl text-2xl font-bold mb-6 md:mb-6 text-[var(--font-color)]">
            Cheque seu e-mail
          </CardTitle>
          <CardDescription className="w-full md:w-112 mb-6 md:mb-4 text-[var(--font-color)]">
            O link para resetar a senha foi enviado para {email}
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center text-center mt-6">
          <a href="/auth" className="w-full text-center underline text-[var(--font-color)]">
            Entrar
          </a>
        </CardFooter>
      </Card>
    </div>
  )
}