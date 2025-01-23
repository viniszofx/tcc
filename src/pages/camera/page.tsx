import { useState, useEffect, useRef } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export function CameraPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(
    "none"
  );
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraStatus, setCameraStatus] = useState<string>("Desativo");
  const [photo, setPhoto] = useState<string | null>(null);

  // Função para solicitar acesso à câmera e iniciar o fluxo de vídeo
  const requestCameraPermission = async (deviceId: string) => {
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId },
      });

      setStream(newStream);
      setCameraStatus("Ativo");

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        await videoRef.current.play();
      }
    } catch (err) {
      setError("Erro ao acessar a câmera.");
      console.error(err);
      setCameraStatus("Desativo");
    }
  };

  // Carregar dispositivos de vídeo (câmeras)
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = allDevices.filter(
          (device) => device.kind === "videoinput"
        );
        setDevices(videoDevices);

        if (videoDevices.length === 0) {
          setSelectedDeviceId("none");
          setCameraStatus("Desativo");
        }
      } catch (err) {
        console.error("Erro ao listar dispositivos:", err);
        setError("Erro ao carregar dispositivos.");
      }
    };
    fetchDevices();
  }, []);

  // Alterar a câmera ou parar a câmera ao selecionar "Nenhuma câmera"
  useEffect(() => {
    if (selectedDeviceId === "none") {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
        setCameraStatus("Desativo");
      }
    } else if (selectedDeviceId) {
      requestCameraPermission(selectedDeviceId);
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
    };
  }, [selectedDeviceId]);

  // Função para tirar foto
  const takePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (context) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;

        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imageUrl = canvas.toDataURL("image/png");
        setPhoto(imageUrl);
      }
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Câmera</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}

      <p>
        Status: <strong>{cameraStatus}</strong>
      </p>

      {/* Dropdown para selecionar a câmera */}
      <Select
        onValueChange={setSelectedDeviceId}
        value={selectedDeviceId || "none"}
      >
        <SelectTrigger className="w-full max-w-xs mb-4">
          <SelectValue placeholder="Selecione a Câmera" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Nenhuma câmera</SelectItem>
          {devices
            .filter((device) => device.deviceId) // Garante que deviceId não seja vazio ou undefined
            .map((device, index) => (
              <SelectItem key={device.deviceId} value={device.deviceId}>
                {device.label || `Câmera ${index + 1}`}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col items-center w-full">
          <div className="w-full max-w-xl mx-auto mb-4 border-2 border-gray-300 rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-auto"
              autoPlay
              muted
              playsInline
            />
          </div>
          <Button
            onClick={takePhoto}
            className="px-4 py-2 bg-blue-600 text-white rounded-md mb-4"
          >
            Tirar Foto
          </Button>
        </div>

        {photo && (
          <div className="flex justify-center items-center w-full">
            <div className="w-full max-w-xl">
              <h2 className="text-lg font-bold mb-4">Foto Capturada</h2>
              <img
                src={photo}
                alt="Foto tirada pela câmera"
                className="w-full h-auto border-2 border-gray-300 rounded-lg"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
