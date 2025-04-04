// useCamera.ts
import { useState, useRef, useEffect } from "react";

export function useCamera() {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
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

      if (videoDevices.length > 0) {
        setSelectedDeviceId(videoDevices[0].deviceId);
      }
    } catch (error) {
      console.error("Erro ao listar dispositivos:", error);
      alert("Não foi possível acessar as câmeras.");
    }
  };

  // Função para acessar a câmera com base no `deviceId` e facingMode
  const handleCameraAccess = async (deviceId: string | null, facingMode: "user" | "environment") => {
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const videoStream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: deviceId || undefined,
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 960 },
        },
      });
      setStream(videoStream);
    } catch (error) {
      console.error("Erro ao acessar a câmera:", error);
      alert("Não foi possível acessar a câmera. Verifique se você concedeu permissões corretamente.");
    }
  };

  // Atualiza o vídeo no `<video>` sempre que o stream muda
  useEffect(() => {
    getAvailableDevices();
  }, []);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch((error) => console.error("Erro ao iniciar o vídeo:", error));
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  return {
    devices,
    selectedDeviceId,
    setSelectedDeviceId,
    facingMode,
    setFacingMode,
    videoRef,
    stream,
    handleCameraAccess,
  };
}
