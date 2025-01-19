import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "./components/ui/card";

export function Index() {
  return (
    <div className="space-y-4 overflow-y-hidden">
      <Card className="bg-zinc-50">
        <CardHeader>
          <div>
            <Badge className="bg-blue-500">Beta</Badge>
            <h1 className="text-lg font-bold">Boas-Vindas</h1>
            <h1 className="text-2xl font-bold">Plataforma Cadê</h1>
          </div>
          <CardDescription>
            <p>Feito para invetariantes</p>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            Cadê é um Plataforma de inventário de bens, onde você pode
            cadastrar, editar, excluir e visualizar bens.
          </p>
        </CardContent>
        <CardFooter className="space-x-2">
          <Button>
            <a href="/cam">Camêra</a>
          </Button>
          <Button>
            <a href="/auth">Login</a>
          </Button>
        </CardFooter>
      </Card>
      <Card className="bg-zinc-50">
        <CardHeader>
          <div>
            <h1 className="text-lg font-bold text-center">Sobre</h1>
            <h1 className="text-2xl font-bold">Plataforma Cadê</h1>
          </div>
          <CardDescription>
            <p>Feito para invetariantes</p>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            Cadê é um Plataforma de inventário de bens, onde você pode
            cadastrar, editar, excluir e visualizar bens.
          </p>
        </CardContent>
        <CardFooter className="space-x-2">
          <Button>Contato</Button>
          <Button>Login</Button>
        </CardFooter>
      </Card>
      <Card className="bg-zinc-50">
        <CardHeader>
          <div>
            <h1 className="text-lg font-bold text-center">Funcionalidades</h1>
            <h1 className="text-2xl font-bold">Plataforma Cadê</h1>
          </div>
          <CardDescription>
            <p>Feito para invetariantes</p>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            Cadê é um Plataforma de inventário de bens, onde você pode
            cadastrar, editar, excluir e visualizar bens.
          </p>
        </CardContent>
        <CardFooter className="space-x-2">
          <Button>Contato</Button>
          <Button>Login</Button>
        </CardFooter>
      </Card>
      <Card className="bg-zinc-50">
        <CardHeader>
          <div>
            <h1 className="text-lg font-bold text-center">Contato</h1>
            <h1 className="text-2xl font-bold">Plataforma Cadê</h1>
          </div>
          <CardDescription>
            <p>Feito para invetariantes</p>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            Cadê é um Plataforma de inventário de bens, onde você pode
            cadastrar, editar, excluir e visualizar bens.
          </p>
        </CardContent>
        <CardFooter className="space-x-2">
          <Button>Contato</Button>
          <Button>Login</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
