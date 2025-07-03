"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useUserPermissions } from "@/hooks/use-user-permissions";
import { useQuery } from "@tanstack/react-query";
import { LogOut, User } from "lucide-react";
import { useEffect, useState } from "react";

export function UserAvatar() {
  const { signOut } = useAuth();
  const { user, loading: permissionsLoading } = useUserPermissions();
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [forceRefresh, setForceRefresh] = useState<number>(0);

  // Usar React Query diretamente para buscar dados do usuário no navbar
  const {
    data: userProfile,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["navbar-user-profile", user?.id, forceRefresh],
    queryFn: async () => {
      if (!user?.id) return null;
      const response = await fetch(`/api/user?id=${user.id}&t=${Date.now()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }
      return response.json();
    },
    enabled: !!user?.id,
    staleTime: 10 * 1000, // 10 segundos apenas
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Escutar mudanças de avatar via eventos personalizados
  useEffect(() => {
    const handleAvatarUpdate = () => {
      setForceRefresh(Date.now());
      setTimeout(() => {
        refetch();
      }, 100);
    };

    // Escutar evento personalizado de atualização de avatar
    window.addEventListener("avatar-updated", handleAvatarUpdate);

    return () => {
      window.removeEventListener("avatar-updated", handleAvatarUpdate);
    };
  }, [refetch]);

  // Gerenciar URL do avatar com cache busting
  useEffect(() => {
    if (userProfile?.avatar) {
      // Se a URL não tem timestamp, adicionar um para forçar reload
      const hasTimestamp =
        userProfile.avatar.includes("?t=") ||
        userProfile.avatar.includes("?nocache=");
      if (!hasTimestamp) {
        setAvatarUrl(`${userProfile.avatar}?t=${Date.now()}`);
      } else {
        setAvatarUrl(userProfile.avatar);
      }
    } else {
      setAvatarUrl("");
    }
  }, [userProfile?.avatar]);

  if (isLoading || permissionsLoading || !user || !userProfile) {
    return (
      <Avatar className="w-10 h-10 border">
        <AvatarFallback>?</AvatarFallback>
      </Avatar>
    );
  }

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <Avatar className="w-10 h-10 cursor-pointer border">
          <AvatarImage
            key={avatarUrl} // Force re-render when avatar changes
            src={avatarUrl}
            alt="Foto do usuário"
            onError={(e) => {
              // Se a imagem falhar ao carregar, tenta novamente sem cache
              const img = e.target as HTMLImageElement;
              if (img.src && !img.src.includes("?nocache=")) {
                const newUrl = `${userProfile.avatar}?nocache=${Date.now()}`;
                img.src = newUrl;
                setAvatarUrl(newUrl);
              }
            }}
          />
          <AvatarFallback className="bg-[var(--button-color)] text-[var(--font-color2)]">
            {getUserInitials(userProfile.name)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-56 bg-[var(--perfil-color)]"
      >
        <DropdownMenuLabel className="flex flex-col">
          <span className="font-bold text-[var(--font-color2)]">
            {userProfile.name}
          </span>
          <span className="text-sm text-[var(--font-color2)]">
            {userProfile.email}
          </span>
          <span className="text-xs text-[var(--font-color2)]">
            {user.role ? user.role.toUpperCase() : ""}
          </span>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-[var(--font-color2)]" />

        <a href="/application/profile">
          <DropdownMenuItem className="flex items-center gap-2 text-[var(--font-color2)] hover:!bg-[var(--hover-color)] hover:!text-white transition-all cursor-pointer">
            <User size={16} className="text-[var(--font-color2)]" />
            <span>Perfil</span>
          </DropdownMenuItem>
        </a>

        <DropdownMenuSeparator className="bg-[var(--font-color2)]" />

        <DropdownMenuItem
          onClick={() => signOut()}
          className="flex items-center gap-2 text-[var(--button-2-color)] hover:!bg-[var(--hover-color)] hover:!text-white transition-all cursor-pointer"
        >
          <LogOut size={16} className="text-[var(--button-2-color)]" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
