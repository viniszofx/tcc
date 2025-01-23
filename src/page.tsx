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
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user"); // Inicialização do modo de câmera
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Função para acessar as câmeras disponíveis
  const getAvailableDevices = async () => {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter(
        (device) => device.kind === "videoinput"
      );
      setDevices(videoDevices);
      console.log("Dispositivos de vídeo:", videoDevices);

      // Selecionar a primeira câmera disponível por padrão
      if (videoDevices.length > 0) {
        setSelectedDeviceId(videoDevices[0].deviceId);
      }
    } catch (error) {
      console.error("Erro ao listar dispositivos:", error);
      alert("Não foi possível acessar as câmeras.");
    }
  };

  // Função para acessar a câmera com base no `deviceId` e facingMode
  const handleCameraAccess = async (
    deviceId: string | null,
    facingMode: "user" | "environment"
  ) => {
    try {
      if (stream) {
        // Parar o stream atual antes de acessar a nova câmera
        stream.getTracks().forEach((track) => track.stop());
      }

      const videoStream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: deviceId || undefined,
          facingMode: facingMode, // Pode ser 'user' (frontal) ou 'environment' (traseira)
          width: { ideal: 1280 }, // Resolução ideal para ajustar proporcionalmente
          height: { ideal: 960 }, // Resolução ideal para ajustar proporcionalmente
        },
      });
      setStream(videoStream);
      setCameraModalOpen(true);
    } catch (error) {
      console.error("Erro ao acessar a câmera:", error);
      alert(
        "Não foi possível acessar a câmera. Verifique se você concedeu permissões corretamente."
      );
    }
  };

  // Atualiza o vídeo no `<video>` sempre que o stream muda
  useEffect(() => {
    if (cameraModalOpen && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch((error) => {
        console.error("Erro ao iniciar o vídeo:", error);
      });
    }

    // Limpeza: parar o stream ao fechar o modal
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraModalOpen, stream]);

  // Carrega os dispositivos ao montar o componente
  useEffect(() => {
    getAvailableDevices();
  }, []);

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
            onClick={() => handleCameraAccess(selectedDeviceId, facingMode)} // Passando o facingMode
            disabled={devices.length === 0}
          >
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
            <div className="relative mb-4">
              <video
                ref={videoRef}
                className="w-full h-auto rounded border object-cover"
                autoPlay
                playsInline
              />
            </div>

            {/* Seletor de câmeras visível apenas em telas grandes */}
            <div className="mb-4 hidden lg:block">
              {devices.length > 0 ? (
                <select
                  className="w-full p-2 border rounded"
                  value={selectedDeviceId || ""}
                  onChange={(e) => {
                    const newDeviceId = e.target.value;
                    setSelectedDeviceId(newDeviceId);
                    handleCameraAccess(newDeviceId, facingMode); // Chamando para mudar a câmera selecionada
                  }}
                >
                  {devices.map((device, index) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Câmera ${index + 1}`}
                    </option>
                  ))}
                </select>
              ) : (
                <p>Nenhuma câmera encontrada.</p>
              )}
            </div>

            {/* Botões para trocar entre câmeras frontal e traseira, visíveis apenas em dispositivos móveis */}
            <div className="mb-4 flex justify-between lg:hidden">
              <Button
                onClick={() => {
                  setFacingMode("user");
                  handleCameraAccess(selectedDeviceId, "user");
                }}
              >
                Frontal
              </Button>
              <Button
                onClick={() => {
                  setFacingMode("environment");
                  handleCameraAccess(selectedDeviceId, "environment");
                }}
              >
                Traseira
              </Button>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setCameraModalOpen(false)}>Fechar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
