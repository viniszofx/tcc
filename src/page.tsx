// Index.tsx
import { useState } from "react";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "./components/ui/card";
import { CameraComponent } from "@/components/custom/camera"; // Importando o componente de câmera
import { Camera } from "lucide-react";

export function Index() {
  const [cameraModalOpen, setCameraModalOpen] = useState(false);

  return (
    <div className="mx-2 md:mx-auto md:max-w-2xl">
      <Card className="bg-zinc-50">
        <CardHeader>
          <div>
            <Badge className="bg-blue-500">Beta</Badge>
            <h1 className="text-lg font-bold">Boas-Vindas</h1>
            <h1 className="text-2xl font-bold">Plataforma Cadê</h1>
          </div>
          <CardDescription>
            <p>Feito para inventariantes</p>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            Cadê é uma plataforma de inventário de bens, onde você pode
            cadastrar, editar, excluir e visualizar bens.
          </p>
        </CardContent>
        <CardFooter className="space-x-2">
          <Button
            onClick={() => setCameraModalOpen(true)} // Abre o modal de câmera
          >
            <Camera />
          </Button>
          <Button>
            <a href="/auth">Login</a>
          </Button>
        </CardFooter>
      </Card>

      {/* Mostra o modal de câmera se estiver aberto */}
      {cameraModalOpen && (
        <CameraComponent onClose={() => setCameraModalOpen(false)} />
      )}
    </div>
  );
}
