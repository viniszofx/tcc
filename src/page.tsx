import { useState, useRef, useEffect } from "react";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "./components/ui/card";
import { Camera } from "lucide-react";

export function Index() {
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const handleCameraAccess = async () => {
    try {
      const videoStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      setStream(videoStream);
      setCameraModalOpen(true);
    } catch (error) {
      console.error("Camera access denied:", error);
      alert("Permissão para acessar a câmera foi negada.");
    }
  };

  useEffect(() => {
    if (cameraModalOpen && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch((error) => {
        console.error("Erro ao iniciar o vídeo:", error);
      });
    }

    // Cleanup: parar o stream ao fechar o modal
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraModalOpen, stream]);

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
          <Button onClick={handleCameraAccess}>
            <Camera />
          </Button>
          <Button>
            <a href="/auth">Login</a>
          </Button>
          <Button>
            <a href="/cam">Câmera</a>
          </Button>
        </CardFooter>
      </Card>

      {cameraModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-4 rounded shadow-lg w-[90%] max-w-md">
            <h2 className="text-lg font-bold mb-4">Acesso à Câmera</h2>
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full h-auto rounded border"
                autoPlay
                playsInline
              />
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={() => setCameraModalOpen(false)}>Fechar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
