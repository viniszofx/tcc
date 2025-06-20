"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { Camera, SwitchCamera } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (data: string) => void;
}

export function CameraModal({ isOpen, onClose, onCapture }: CameraModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = "qr-reader-container";

  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>(
    []
  );
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment"
  );
  const [scannerRunning, setScannerRunning] = useState(false);
  const [videoRunning, setVideoRunning] = useState(false);
  const [useScanner, setUseScanner] = useState(true); // true: leitura qr/barcode; false: captura manual

  const isMobile = () =>
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  // Lista câmeras
  const listCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((d) => d.kind === "videoinput");
      setAvailableCameras(videoDevices);
      if (videoDevices.length > 0 && !selectedCameraId) {
        setSelectedCameraId(videoDevices[0].deviceId);
      }
    } catch (e) {
      console.error("Erro ao listar câmeras:", e);
    }
  };

  // Para o vídeo (stream)
  const stopVideo = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream)
        .getTracks()
        .forEach((t) => t.stop());
      videoRef.current.srcObject = null;
      setVideoRunning(false);
    }
  };

  // Para o scanner QR
  const stopScanner = async () => {
    if (qrScannerRef.current) {
      try {
        await qrScannerRef.current.stop();
      } catch (e) {
        // pode já estar parado
      }
      try {
        await qrScannerRef.current.clear();
      } catch (e) {}
      qrScannerRef.current = null;
      setScannerRunning(false);
    }
  };

  // Para tudo
  const stopAll = async () => {
    stopVideo();
    await stopScanner();
  };

  // Inicia vídeo para captura manual
  const startVideo = async () => {
    await stopAll();

    if (!selectedCameraId) return;

    const constraints = {
      video: {
        deviceId: { exact: selectedCameraId },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setVideoRunning(true);
      }
    } catch (e) {
      alert("Não foi possível iniciar a câmera");
      onClose();
    }
  };

  // Inicia leitor qr/barcode
  const startScanner = async () => {
    await stopScanner();

    if (!selectedCameraId) return;

    const scanner = new Html5Qrcode(containerId);
    qrScannerRef.current = scanner;

    const config = {
      fps: 10,
      qrbox: 250,
      formatsToSupport: [
        Html5QrcodeSupportedFormats.QR_CODE,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.CODABAR,
      ],
    };

    try {
      await scanner.start(
        { deviceId: { exact: selectedCameraId } },
        config,
        (decodedText) => {
          setUseScanner(false);
          onCapture(decodedText);
          handleClose();
        },
        (error) => {
          // silencioso
        }
      );
      setScannerRunning(true);
    } catch (e) {
      alert("Erro ao iniciar scanner");
      onClose();
    }
  };

  // Ao abrir modal lista câmeras
  useEffect(() => {
    if (isOpen) {
      listCameras();
    } else {
      stopAll();
    }
  }, [isOpen]);

  // Quando seleciona câmera, inicia o vídeo ou scanner conforme modo
  useEffect(() => {
    if (!isOpen || !selectedCameraId) return;

    if (useScanner) {
      startScanner();
      stopVideo();
    } else {
      startVideo();
      stopScanner();
    }
  }, [selectedCameraId, useScanner, isOpen]);

  // Alterna entre scanner e captura manual
  const toggleMode = () => {
    setUseScanner((v) => !v);
  };

  // Alterna câmera (desktop select ou mobile toggle)
  const changeCamera = (deviceId: string) => {
    setSelectedCameraId(deviceId);
  };

  const toggleFacingMode = () => {
    setFacingMode((f) => (f === "environment" ? "user" : "environment"));
    // Note: aqui poderia atualizar selectedCameraId para câmera com facingMode
  };

  const handleCapture = () => {
    if (!videoRunning || !videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imgData = canvas.toDataURL("image/jpeg");
    onCapture(imgData);
    handleClose();
  };

  const handleClose = async () => {
    await stopAll();
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <DialogContent className="sm:max-w-[600px]">
        <DialogTitle>Leitor QR e Captura de Foto</DialogTitle>
        <DialogDescription>
          {useScanner
            ? "Aponte a câmera para um QR Code ou código de barras."
            : "Capture uma foto manualmente."}
        </DialogDescription>

        {/* Se desktop, select para trocar câmera */}
        {!isMobile() && (
          <select
            className="mb-4 w-full rounded border border-input p-2"
            value={selectedCameraId}
            onChange={(e) => changeCamera(e.target.value)}
          >
            {availableCameras.map((cam) => (
              <option key={cam.deviceId} value={cam.deviceId}>
                {cam.label || `Câmera ${availableCameras.indexOf(cam) + 1}`}
              </option>
            ))}
          </select>
        )}

        <div className="relative">
          {useScanner ? (
            <div id={containerId} className="w-full" />
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full rounded-lg"
            />
          )}

          {isMobile() && (
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-2 right-2 rounded-full p-2"
              onClick={() => {
                toggleFacingMode();
              }}
              title="Alternar câmera"
            >
              <SwitchCamera className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="mt-4 flex justify-between">
          <Button onClick={toggleMode} variant="outline">
            {useScanner ? "Captura manual" : "Leitura QR/Barcode"}
          </Button>

          {!useScanner && (
            <Button
              onClick={handleCapture}
              disabled={!videoRunning}
              className="flex items-center gap-2"
            >
              <Camera className="h-4 w-4" />
              Capturar Foto
            </Button>
          )}
        </div>

        <DialogFooter className="flex justify-end mt-4 gap-2">
          <Button onClick={handleClose} variant="secondary">
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
