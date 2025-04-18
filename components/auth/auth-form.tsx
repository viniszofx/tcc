import { signIn, signInWithGoogle } from "@/app/(auth)/auth/_action"
import { FaGoogle } from "react-icons/fa"
import { Button } from "../ui/button"
import { CardContent, CardFooter } from "../ui/card"
import { Input } from "../ui/input"

export default function AuthForm() {
  return (
    <div className="w-full flex justify-start md:justify-center">
      <div className="w-full md:max-w-[28rem]">
        <CardContent className="space-y-4 text-center p-0">
          <form className="w-full space-y-3 text-left">
            <Input className="border-[var(--border-input)]" placeholder="Email" name="email" type="email" />
            <Input
              className="border-[var(--border-input)]"
              placeholder="Senha"
              name="password"
              type="password"
              required
            />
            <Button
              formAction={signIn}
              className="w-full border-[var(--border-color)] bg-[var(--bg-simple)] cursor-pointer hover:!bg-[var(--hover-color)] hover:!text-white transition-all"
              variant={"outline"}
              type="submit"
            >
              Entrar
            </Button>
            <p className="block w-full text-xs md:text-sm text-end text-[var(--font-color)]">
              <a href="/auth/forget-password" className="hover:underline">
                Esqueci minha senha
              </a>
            </p>
          </form>

          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[var(--border-color)]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[var(--bg-simple)] px-2 text-[var(--font-color)]">ou</span>
            </div>
          </div>

          <form className="w-full">
            <Button
              formAction={signInWithGoogle}
              className="w-full border-[var(--border-color)] bg-[var(--bg-simple)] hover:!bg-[var(--hover-color)] hover:!text-white transition-all"
              variant="outline"
              type="submit"
            >
              <FaGoogle className="mr-2" />
              Continuar com Google
            </Button>
          </form>
        </CardContent>

        <CardFooter className="mt-6 flex flex-col items-center text-center">
          <p className="text-xs md:text-sm text-[var(--font-color)]">
            Não possui uma conta? Entre em contato com o administrador do sistema para solicitar acesso
          </p>
        </CardFooter>
      </div>
    </div>
  )
}