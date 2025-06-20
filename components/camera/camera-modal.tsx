"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { Camera, SwitchCamera, ZoomIn } from "lucide-react";
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
  const [captureResult, setCaptureResult] = useState<{
    type: "image" | "qr";
    data: string;
  } | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1); // New zoom state

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

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const constraints = {
      video: isIOS
        ? {
            facingMode: { exact: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          }
        : {
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
      console.error("Start video error:", e);
      alert("Não foi possível iniciar a câmera traseira");
      onClose();
    }
  };

  // Inicia leitor qr/barcode
  const startScanner = async () => {
    await stopScanner();

    if (!selectedCameraId) return;

    const scanner = new Html5Qrcode(containerId);
    qrScannerRef.current = scanner;

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const cameraConfig = isIOS
      ? { facingMode: { exact: "environment" } }
      : { deviceId: { exact: selectedCameraId } };

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
        cameraConfig,
        config,
        (decodedText) => {
          setUseScanner(false);
          setCaptureResult({ type: "qr", data: decodedText });
        },
        (error) => {
          // silencioso
        }
      );
      setScannerRunning(true);
    } catch (e) {
      // Se falhar com exact constraint, tenta sem
      if (isIOS) {
        try {
          await scanner.start(
            { facingMode: "environment" },
            config,
            (decodedText) => {
              setUseScanner(false);
              setCaptureResult({ type: "qr", data: decodedText });
            },
            (error) => {
              // silencioso
            }
          );
          setScannerRunning(true);
          return;
        } catch (fallbackError) {
          console.error("Scanner error:", fallbackError);
        }
      }
      alert("Erro ao iniciar scanner");
      onClose();
    }
  };

  const requestIOSPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { exact: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch (error) {
      console.error("iOS Camera permission error:", error);
      return false;
    }
  };

  // Add this new function after isMobile()
  const requestAndroidPermission = async () => {
    try {
      // First try to get existing permission status
      const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
      
      if (result.state === 'denied') {
        alert('Por favor, permita o acesso à câmera nas configurações do seu navegador.');
        return false;
      }

      // Explicitly request camera access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          facingMode: { exact: "environment" },
        } 
      });
      
      // Stop the test stream immediately
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Android Camera permission error:', error);
      return false;
    }
  };

  // Update the initializeCamera function
  const initializeCamera = async () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/i.test(navigator.userAgent);

    if (isIOS) {
      const hasPermission = await requestIOSPermission();
      if (!hasPermission) {
        alert('Por favor, permita o acesso à câmera nas configurações do Safari.');
        onClose();
        return false;
      }
    } else if (isAndroid) {
      const hasPermission = await requestAndroidPermission();
      if (!hasPermission) {
        alert('Por favor, permita o acesso à câmera nas configurações do seu navegador.');
        onClose();
        return false;
      }
    }

    try {
      await listCameras();
      return true;
    } catch (error) {
      console.error('Camera initialization error:', error);
      const message = isAndroid 
        ? 'Verifique as permissões da câmera nas configurações do Chrome'
        : 'Erro ao inicializar a câmera. Verifique as permissões.';
      alert(message);
      onClose();
      return false;
    }
  };

  // Ao abrir modal lista câmeras
  useEffect(() => {
    if (isOpen) {
      (async () => {
        const initialized = await initializeCamera();
        if (!initialized) {
          onClose();
        }
      })();
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

  // Adicionado para confirmar resultado da captura
  const handleConfirmResult = () => {
    if (captureResult) {
      onCapture(captureResult.data);
      setCaptureResult(null);
      handleClose();
    }
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
    setCaptureResult({ type: "image", data: imgData });
  };

  // Update the handleClose function
  const handleClose = async () => {
    try {
      // Stop video tracks
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => {
          track.stop();
          stream.removeTrack(track);
        });
        videoRef.current.srcObject = null;
      }

      // Stop scanner if running
      await stopScanner();

      // Reset states
      setVideoRunning(false);
      setScannerRunning(false);
      setCaptureResult(null);
      setZoomLevel(1);

      // Call parent close handler
      onClose();
    } catch (error) {
      console.error("Error closing camera:", error);
      onClose();
    }
  };

  const showCameraToggle = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    return isMobile() && !isIOS;
  };

  // Zoom control function
  const handleZoom = async () => {
    if (!videoRef.current?.srcObject) return;

    const stream = videoRef.current.srcObject as MediaStream;
    const videoTrack = stream.getVideoTracks()[0];

    try {
      const capabilities =
        videoTrack.getCapabilities() as MediaTrackCapabilities & {
          zoom?: number | { min: number; max: number; step: number };
        };
      // Check if zoom is supported
      if (!capabilities.zoom) {
        console.warn("Zoom não suportado nesta câmera");
        return;
      }

      const settings = videoTrack.getSettings() as MediaTrackSettings & {
        zoom?: number;
      };
      const currentZoom = settings.zoom ?? 1;

      // Toggle between zoom levels: 1 -> 1.5 -> 2 -> 1
      const newZoom = currentZoom === 1 ? 1.5 : currentZoom === 1.5 ? 2 : 1;

      await videoTrack.applyConstraints({
        advanced: [{ zoom: newZoom }] as any,
      } as any);

      setZoomLevel(newZoom);
    } catch (error) {
      console.error("Erro ao ajustar zoom:", error);
    }
  };

  return (
    <>
      {/* Existing camera dialog */}
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleClose();
          }
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

            {!useScanner && videoRunning && (
              <Button
                variant="secondary"
                size="icon"
                className="absolute bottom-2 right-2 rounded-full p-2"
                onClick={handleZoom}
                title={`Zoom ${zoomLevel}x`}
              >
                <ZoomIn className="h-4 w-4" />
                <span className="ml-1 text-xs">{zoomLevel}x</span>
              </Button>
            )}

            {showCameraToggle() && (
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

      {/* Result dialog */}
      <Dialog
        open={captureResult !== null}
        onOpenChange={() => setCaptureResult(null)}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {captureResult?.type === "image"
                ? "Foto Capturada"
                : "Código Lido"}
            </DialogTitle>
            <DialogDescription>
              {captureResult?.type === "image"
                ? "Confirme se a foto está adequada"
                : "Confirme se o código foi lido corretamente"}
            </DialogDescription>
          </DialogHeader>

          <div className="my-4">
            {captureResult?.type === "image" ? (
              <img
                src={captureResult.data}
                alt="Captured"
                className="w-full rounded-lg"
              />
            ) : (
              <div className="p-4 bg-muted rounded-lg">
                <p className="break-all">{captureResult?.data}</p>
              </div>
            )}
          </div>

          <DialogFooter className="flex justify-between gap-2">
            <Button variant="outline" onClick={() => setCaptureResult(null)}>
              Tentar Novamente
            </Button>
            <Button onClick={handleConfirmResult}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
