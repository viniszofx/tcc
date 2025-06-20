import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Camera, SwitchCamera } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageData: string) => void;
}

export function CameraModal({ isOpen, onClose, onCapture }: CameraModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">(
    "environment"
  );
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>(
    []
  );
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const [cameraStarted, setCameraStarted] = useState(false);

  const isMobile = () =>
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream | null;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraStarted(false);
  };

  const getAvailableCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput"
      );
      setAvailableCameras(videoDevices);
      if (videoDevices.length > 0) {
        setSelectedCameraId(videoDevices[0].deviceId);
      }
    } catch (err) {
      console.error("Erro ao obter câmeras:", err);
    }
  };

  const requestCameraPermission = async () => {
    try {
      const permission = await navigator.permissions.query({
        name: "camera" as PermissionName,
      });

      if (permission.state === "denied") {
        alert(
          "Permissão de câmera negada. Altere nas configurações do navegador."
        );
        return false;
      }

      return true;
    } catch (err) {
      console.warn("Permissões não disponíveis, tentando acessar diretamente.");
      return true; // alguns browsers não suportam permissions.query
    }
  };

  const enableCamera = async () => {
    stopCamera();

    const constraints = isMobile()
      ? {
          video: {
            facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        }
      : {
          video: {
            deviceId: selectedCameraId,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        };

    try {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        onClose();
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraStarted(true);
    } catch (err) {
      console.error("Erro ao acessar a câmera:", err);
      alert("Não foi possível acessar a câmera.");
      onClose();
    }
  };

  const handleCapture = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext("2d");
      context?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL("image/jpeg");
      onCapture(imageData);
      handleClose();
    }
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  const toggleCamera = () => {
    if (isMobile()) {
      setFacingMode((prev) =>
        prev === "environment" ? "user" : "environment"
      );
      setCameraStarted(false); // reinicia a câmera
    } else {
      const currentIndex = availableCameras.findIndex(
        (camera) => camera.deviceId === selectedCameraId
      );
      const nextIndex = (currentIndex + 1) % availableCameras.length;
      setSelectedCameraId(availableCameras[nextIndex].deviceId);
      setCameraStarted(false); // reinicia a câmera
    }
  };

  useEffect(() => {
    if (isOpen) {
      getAvailableCameras();
    }
  }, [isOpen]);

  useEffect(() => {
    if (cameraStarted && (selectedCameraId || isMobile())) {
      enableCamera();
    }
    // cleanup ao desmontar
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode, selectedCameraId]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[600px]">
        <DialogTitle>Câmera</DialogTitle>
        <DialogDescription id="camera-desc">
          Posicione o item no centro da câmera
        </DialogDescription>

        {!isMobile() && (
          <div className="mb-4">
            <select
              value={selectedCameraId}
              onChange={(e) => {
                setSelectedCameraId(e.target.value);
                setCameraStarted(false); // reinicia câmera ao trocar
              }}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {availableCameras.map((camera, index) => (
                <option key={camera.deviceId} value={camera.deviceId}>
                  {camera.label || `Camera ${index + 1}`}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full rounded-lg"
            aria-describedby="camera-desc"
          />
          {isMobile() && availableCameras.length > 1 && (
            <Button
              onClick={toggleCamera}
              className="absolute top-2 right-2 rounded-full p-2"
              variant="secondary"
              size="icon"
            >
              <SwitchCamera className="h-4 w-4" />
            </Button>
          )}
        </div>

        {!cameraStarted && (
          <div className="mt-4 flex justify-end">
            <Button onClick={enableCamera}>Iniciar Câmera</Button>
          </div>
        )}

        <DialogFooter className="flex justify-end items-center">
          <Button
            onClick={handleCapture}
            className="flex items-center gap-2"
            disabled={!cameraStarted}
          >
            <Camera className="h-4 w-4" />
            Capturar Foto
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
