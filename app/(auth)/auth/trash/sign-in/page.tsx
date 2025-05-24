import AuthForm from "@/components/auth/auth-form"
import DarkModeToggle from "@/components/custom/dark-mode-toggle"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"

export const metadata = {
  title: "Entrar na conta - KDÊ",
}

export default function AuthPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="absolute top-2 left-2 md:bottom-4 md:right-4 md:top-auto z-10">
        <DarkModeToggle />
      </div>
      <Image className="mx-auto w-72 h-auto md:hidden" src="/logotipo.svg" alt="logo" width={288} height={100} />
      <Card className="mx-auto max-w-3xl w-full mt-4 overflow-auto md:p-8 border-[var(--border-color)] bg-[var(--bg-simple)]">
        <CardHeader className="w-full flex flex-col items-start md:items-center text-left md:text-center px-4 md:px-6">
          <Image className="w-88 h-auto hidden md:block mb-6" src="/logotipo.svg" alt="logo" width={352} height={100} />
          <CardTitle className="text-3xl md:text-4xl font-bold text-[var(--font-color)]">Entrar na conta</CardTitle>
          <CardDescription className="mt-2 text-sm md:text-base text-[var(--font-color)]">
            Insira sua credenciais para acessar o sistema de inventário
          </CardDescription>
        </CardHeader>
        <CardContent className="w-full space-y-3 mt-4 px-4 md:px-6">
          <AuthForm />
        </CardContent>
      </Card>
    </div>
  )
}