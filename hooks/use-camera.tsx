// useCamera.ts
import { useEffect, useRef, useState } from "react";

export function useCamera() {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const checkPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch (error) {
      console.error("Erro de permissão da câmera:", error);
      return false;
    }
  };

  // Função para acessar as câmeras disponíveis
  const getAvailableDevices = async () => {
    try {
      // Verifica permissões primeiro
      const hasPermission = await checkPermissions();
      if (!hasPermission) {
        throw new Error("Permissão da câmera negada");
      }

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
      alert("Não foi possível acessar as câmeras. Verifique as permissões.");
    }
  };

  // Função para acessar a câmera com base no `deviceId` e facingMode
  const handleCameraAccess = async (
    deviceId: string | null,
    facingMode: "user" | "environment"
  ) => {
    try {
      // Stop existing stream if any
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      // Check if we have permission first
      const permission = await navigator.permissions.query({
        name: "camera",
      } as any);
      if (permission.state === "denied") {
        throw new Error("Permissão da câmera negada");
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
      alert(
        "Não foi possível acessar a câmera. Verifique se você concedeu permissões corretamente."
      );
    }
  };

  useEffect(() => {
    getAvailableDevices();
  }, []);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current
        .play()
        .catch((error) => console.error("Erro ao iniciar o vídeo:", error));
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
