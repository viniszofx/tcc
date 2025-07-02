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
import type { UserProfile } from "@/interface";
import { LogOut, User } from "lucide-react";
import { useEffect, useState } from "react";

export function UserAvatar() {
  const { signOut } = useAuth();
  const { user, loading: permissionsLoading } = useUserPermissions();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.id || permissionsLoading) return;

      setLoading(true);
      try {
        const response = await fetch(`/api/user?id=${user.id}`);
        if (response.ok) {
          const profileData = await response.json();
          setUserProfile(profileData);
        }
      } catch (error) {
        console.error("Erro ao buscar perfil do usuário:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id && !permissionsLoading) {
      fetchUserProfile();
    }
  }, [user?.id, permissionsLoading]);

  if (loading || permissionsLoading || !user || !userProfile) {
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
          <AvatarImage src={userProfile.avatar || ""} alt="Foto do usuário" />
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
