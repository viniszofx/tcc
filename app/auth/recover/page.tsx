"use client"

import DarkModeToggle from "@/app/custom/dark-mode-toggle"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export default function RecoverPasswordPage() {
  const [email, setEmail] = useState("")

  const handleEmailChange = (e:any) => {
    setEmail(e.target.value)
  }

  const handleSubmit = (e:any) => {
    e.preventDefault()
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4">
      <div className="absolute top-2 left-2 md:bottom-4 md:right-4 md:top-auto">
        <DarkModeToggle />
      </div>
      <img className="mx-auto w-72 h-auto md:hidden" src="/Logotipo.svg" alt="logo" />
      <Card className="mx-auto max-w-3xl w-full mt-4 max-h-full md:p-8 border-[var(--border-color)] bg-[var(--bg-simple)]">
        <CardHeader className="flex flex-col items-start md:items-center text-left md:text-center">
          <img className="w-88 h-auto hidden md:block mb-6" src="/Logotipo.svg" alt="logo" />
          <CardTitle className="text-4xl font-bold mb-6 md:mb-2 text-[var(--font-color)]">Esqueceu a senha?</CardTitle>
          <CardDescription className="w-full md:w-112 mb-6 md:mb-4 text-[var(--font-color)]">
            Digite seu endereço de e-mail e enviaremos um link para redefinir a senha
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 flex flex-col items-center">
          <form onSubmit={handleSubmit} className="w-full md:w-112 space-y-3">
            <Input
              className="border-[var(--border-input)]"
              placeholder="Email"
              type="email"
              value={email}
              onChange={handleEmailChange}
            />
            <Button
              type="submit"
              className="w-full border-[var(--border-color)] bg-[var(--bg-simple)] cursor-pointer hover:!bg-[var(--hover-color)] hover:!text-white transition-all"
              variant={"outline"}
            >
              Enviar link de redefinição
            </Button>
          </form>

        </CardContent>
        <CardFooter className="flex justify-center text-center mt-6">
          <p className="w-full md:w-112 text-sm mt-2 text-[var(--font-color)]">
            Você não recebeu o link no seu e-mail? Cheque seu spam ou tente{" "}
            <a href="/auth" className="underline text-[var(--font-color)]">
              outro e-mail.
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}