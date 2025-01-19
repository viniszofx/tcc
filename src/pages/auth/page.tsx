import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@radix-ui/react-separator";
import { FaGoogle } from "react-icons/fa";

export function AuthPage() {
  return (
    <div className="min-h-screen mx-auto container flex flex-col justify-center items-center bg-zinc-100 antialiased">
      <Card className="w-full max-w-lg bg-zinc-50 shadow-lg">
        <CardHeader className="text-center">
          <h1 className="text-xl font-bold">Autenticação</h1>
          <CardDescription>
            <p>Autentique-se para acessar a plataforma</p>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action="" method="post" className="space-y-4">
            <Input
              placeholder="Email"
              type="email"
              required
              aria-label="Digite seu email"
            />
            <Input
              placeholder="Password"
              type="password"
              required
              aria-label="Digite sua senha"
            />
            <Button type="submit" className="w-full">
              Login
            </Button>
            <Separator orientation="horizontal" className="text-center">
              ou
            </Separator>
            <Button type="button" className="w-full">
              <a href="/">
                <FaGoogle />
              </a>
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button variant={"link"}>
            <a href="/">Reculperar Senha</a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
