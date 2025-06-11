"use client";

import { signInWithMagicLink } from "@/app/(auth)/auth/_action";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "../ui/button";
import { CardContent, CardFooter } from "../ui/card";
import { Input } from "../ui/input";

export default function FirstAccessEmail() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signInWithMagicLink(formData);
      console.log("result", result);

      if (result.error) {
        setError(result.error);
      } else {
        router.push("/register-email");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex justify-start md:justify-center">
      <div className="w-full md:max-w-[28rem]">
        <CardContent className="space-y-4 text-center p-0">
          <form action={handleSubmit} className="w-full space-y-3 text-left">
            <div className="flex flex-col space-y-1">
              <label className="text-md font-medium text-[var(--font-color)]">
                Digite seu e-mail institucional:
              </label>
              <Input
                className="border-[var(--border-input)]"
                placeholder="seuemail@institutofederal.edu.br"
                name="email"
                type="email"
                required
                disabled={isLoading}
              />
            </div>
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
            <Button
              className="w-full border-[var(--border-color)] bg-[var(--bg-simple)] cursor-pointer hover:!bg-[var(--hover-color)] hover:!text-white transition-all disabled:opacity-50"
              variant={"outline"}
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Receber Link de Acesso"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="mt-12 flex flex-col items-center text-center">
          <p className="text-xs md:text-sm text-[var(--font-color)]">
            Você receberá um e-mail com o link para acessar o sistema. Entre em
            contato com o campus caso não tenha acesso.
          </p>
        </CardFooter>
      </div>
    </div>
  );
}
