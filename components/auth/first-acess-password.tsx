import { signIn, signInWithGoogle, signUp, } from "@/app/(auth)/auth/_action"
import { Button } from "../ui/button"
import { CardContent, CardFooter } from "../ui/card"
import { Input } from "../ui/input"

export default function FirstAcessPassword() {

    return (
        <div className="w-full flex justify-start md:justify-center">
            <div className="w-full md:max-w-[28rem]">
                <CardContent className="space-y-4 text-center p-0">
                    <form className="w-full space-y-3 text-left">
                        <div className="flex flex-col space-y-1">
                        <label className="text-md font-medium text-[var(--font-color)]">Senha:</label>
                        <Input
                            className="border-[var(--border-input)]"
                            placeholder="Senha"
                            name="password"
                            type="password"
                        />
                        </div>
                        <Button
                            formAction={signUp}
                            className="w-full border-[var(--border-color)] bg-[var(--bg-simple)] cursor-pointer hover:!bg-[var(--hover-color)] hover:!text-white transition-all"
                            variant={"outline"}
                            type="submit"
                        >
                            Entrar
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="mt-12 flex flex-col items-center text-center">
                    <p className="text-xs md:text-sm text-[var(--font-color)]">
                        Você não recebeu o e-mail? Cheque seu spam ou tente <a className="underline" href="/auth/sign-up">outro e-mail.</a>
                    </p>
                </CardFooter>
            </div>
        </div>
    )
}