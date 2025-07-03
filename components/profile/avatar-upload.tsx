"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { queryKeys } from "@/hooks/queries/query-keys";
import { useQueryClient } from "@tanstack/react-query";
import { Camera, Trash2, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AvatarCropper } from "./avatar-cropper";

interface AvatarUploadProps {
  currentAvatar?: string | null;
  userName: string;
  onAvatarUpdate: (avatarUrl: string) => void;
  onAvatarDelete: () => void;
  isLoading?: boolean;
}

export function AvatarUpload({
  currentAvatar,
  userName,
  onAvatarUpdate,
  onAvatarDelete,
  isLoading = false,
}: AvatarUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [displayAvatar, setDisplayAvatar] = useState<string>("");
  const queryClient = useQueryClient();

  // Gerenciar URL do avatar com cache busting
  useEffect(() => {
    if (currentAvatar) {
      // Se a URL não tem timestamp, adicionar um para forçar reload
      const hasTimestamp =
        currentAvatar.includes("?t=") || currentAvatar.includes("?nocache=");
      if (!hasTimestamp) {
        setDisplayAvatar(`${currentAvatar}?t=${Date.now()}`);
      } else {
        setDisplayAvatar(currentAvatar);
      }
    } else {
      setDisplayAvatar("");
    }
  }, [currentAvatar]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      alert("Tipo de arquivo não suportado. Use JPEG, PNG ou WebP.");
      return;
    }

    // Validar tamanho (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert("Arquivo muito grande. Máximo 5MB.");
      return;
    }

    // Criar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreviewImage(result);
      setIsCropperOpen(true);
    };
    reader.readAsDataURL(file);

    // Limpar input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCropComplete = async (croppedImageBlob: Blob) => {
    setIsUploading(true);
    try {
      // Criar FormData para upload
      const formData = new FormData();
      const file = new File([croppedImageBlob], "avatar.jpg", {
        type: "image/jpeg",
      });
      formData.append("avatar", file);

      // Fazer upload
      const response = await fetch("/api/user/avatar", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        // Usar a URL original do servidor, mas adicionar timestamp no componente
        onAvatarUpdate(result.avatarUrl);

        // Disparar evento personalizado para forçar atualização do UserAvatar
        window.dispatchEvent(new CustomEvent("avatar-updated"));

        // Invalidar imediatamente todos os caches relacionados ao usuário
        queryClient.invalidateQueries({ queryKey: ["navbar-user-profile"] });
        queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
        queryClient.invalidateQueries({ queryKey: ["user-permissions"] });
        queryClient.invalidateQueries({ queryKey: queryKeys.users.details() });

        // Invalidar cache do React Query para atualizar dados do usuário em todos os componentes
        // Usar um delay para permitir que o servidor processe completamente
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
          queryClient.invalidateQueries({ queryKey: ["user-permissions"] });
          queryClient.invalidateQueries({
            queryKey: queryKeys.users.details(),
          });
          // Invalidar também o cache específico do navbar
          queryClient.invalidateQueries({ queryKey: ["navbar-user-profile"] });
        }, 1000);

        alert("Avatar atualizado com sucesso!");
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Erro ao atualizar avatar");
      }
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      alert("Erro inesperado ao atualizar avatar");
    } finally {
      setIsUploading(false);
      setPreviewImage(null);
      setIsCropperOpen(false);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!confirm("Tem certeza que deseja remover seu avatar?")) return;

    setIsUploading(true);
    try {
      const response = await fetch("/api/user/avatar", {
        method: "DELETE",
      });

      if (response.ok) {
        onAvatarDelete();

        // Disparar evento personalizado para forçar atualização do UserAvatar
        window.dispatchEvent(new CustomEvent("avatar-updated"));

        // Invalidar imediatamente o cache do navbar para atualização instantânea
        queryClient.invalidateQueries({ queryKey: ["navbar-user-profile"] });

        // Invalidar cache do React Query para atualizar dados do usuário em todos os componentes
        queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
        queryClient.invalidateQueries({ queryKey: ["user-permissions"] });
        // Invalidar também o cache específico do usuário para atualizar UserAvatar
        queryClient.invalidateQueries({ queryKey: queryKeys.users.details() });
        // Invalidar também o cache específico do navbar
        queryClient.invalidateQueries({ queryKey: ["navbar-user-profile"] });

        alert("Avatar removido com sucesso!");
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Erro ao remover avatar");
      }
    } catch (error) {
      console.error("Erro ao remover avatar:", error);
      alert("Erro inesperado ao remover avatar");
    } finally {
      setIsUploading(false);
    }
  };

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Avatar */}
      <div className="relative">
        <Avatar className="w-32 h-32 border-4 border-[var(--border-color)]">
          <AvatarImage
            key={displayAvatar} // Force re-render when avatar changes
            src={displayAvatar}
            alt={userName}
            onError={(e) => {
              // Se a imagem falhar ao carregar, tenta novamente sem cache
              const img = e.target as HTMLImageElement;
              if (img.src && !img.src.includes("?nocache=") && currentAvatar) {
                const newUrl = `${currentAvatar}?nocache=${Date.now()}`;
                img.src = newUrl;
                setDisplayAvatar(newUrl);
              }
            }}
          />
          <AvatarFallback className="text-2xl font-bold bg-[var(--button-color)] text-[var(--font-color2)]">
            {getUserInitials(userName)}
          </AvatarFallback>
        </Avatar>

        {/* Overlay de câmera */}
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
          <Camera
            className="w-8 h-8 text-white"
            onClick={() => fileInputRef.current?.click()}
          />
        </div>
      </div>

      {/* Botões de ação */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading || isUploading}
          className="border-[var(--border-color)] hover:bg-[var(--hover-3-color)]"
        >
          <Upload className="w-4 h-4 mr-2" />
          {isUploading ? "Uploading..." : "Alterar"}
        </Button>

        {displayAvatar && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeleteAvatar}
            disabled={isLoading || isUploading}
            className="border-red-300 text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Remover
          </Button>
        )}
      </div>

      {/* Input de arquivo oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Cropper Modal */}
      {previewImage && (
        <AvatarCropper
          isOpen={isCropperOpen}
          onClose={() => {
            setIsCropperOpen(false);
            setPreviewImage(null);
          }}
          imageSrc={previewImage}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
}
