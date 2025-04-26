// Camera.tsx
import { Button } from "@/components/ui/button";
import { useCamera } from "@/hooks/use-camera";
import { useEffect } from "react";

type CameraProps = {
  onClose: () => void; // Função de fechamento
};

export function CameraComponent({ onClose }: CameraProps) {
  const {
    devices,
    selectedDeviceId,
    setSelectedDeviceId,
    facingMode,
    setFacingMode,
    videoRef,
    handleCameraAccess,
  } = useCamera();

  // Only start camera after component is mounted
  useEffect(() => {
    const startCamera = async () => {
      await handleCameraAccess(selectedDeviceId, facingMode);
    };
    startCamera();
  }, []); // Run only on mount

  return (
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
                handleCameraAccess(newDeviceId, facingMode);
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
          <Button onClick={onClose}>Fechar</Button>
        </div>
      </div>
    </div>
  );
}
