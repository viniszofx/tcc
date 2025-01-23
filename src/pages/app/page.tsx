import React, { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Download, Upload } from "lucide-react";
import { Separator } from "../../components/ui/separator";

export function AppPage() {
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("File uploaded:", file);
      setUploadFile(file);
    }
  };

  return (
    <Card className="m-2 md:m-0">
      <CardHeader>
        <CardTitle>#20250117</CardTitle>
        <CardDescription>Sala dos Professores</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-between items-center">
        <div>
          <p className="text-xs">Status</p>
          <Badge className="bg-green-500">Completo</Badge>
        </div>
        <Separator orientation="vertical" />
        <div>
          {/* Botão para acesso à câmera */}
          <Button onClick={handleCameraAccess}>
            <Camera />
          </Button>

          {/* Input para upload de arquivos */}
          <Button>
            <Upload />
          </Button>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileUpload}
          />

          {/* Botão de download (exemplo, funcionalidade não implementada) */}
          <Button>
            <Download />
          </Button>
        </div>
      </CardContent>

      {/* Modal para acesso à câmera */}
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

      {/* Exibição do arquivo carregado */}
      {uploadFile && (
        <div className="mt-4 p-2 border rounded">
          <p>Arquivo carregado: {uploadFile.name}</p>
          <p>Tamanho: {(uploadFile.size / 1024).toFixed(2)} KB</p>
        </div>
      )}
    </Card>
  );
}
