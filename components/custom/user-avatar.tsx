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
import { LogOut, User } from "lucide-react";
import { useEffect, useState } from "react";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  organization?: {
    id: string;
    name: string;
  };
}

export function UserAvatar() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, signOut } = useAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.email) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/auth/get-user-role", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: user.email }),
        });

        if (response.ok) {
          const data = await response.json();
          setUserData(data.user);
        } else {
          console.error("Erro ao buscar dados do usuário");
        }
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  if (loading || !userData) {
    return (
      <Avatar className="w-10 h-10 border">
        <AvatarFallback>?</AvatarFallback>
      </Avatar>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <Avatar className="w-10 h-10 cursor-pointer border">
          <AvatarImage src="/logo.svg" alt="Foto do usuário" />
          <AvatarFallback>{userData.name.charAt(0)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-56 bg-[var(--perfil-color)]"
      >
        <DropdownMenuLabel className="flex flex-col">
          <span className="font-bold text-[var(--font-color2)]">
            {userData.name}
          </span>
          <span className="text-sm text-[var(--font-color2)]">
            {userData.email}
          </span>
          <span className="text-xs text-[var(--font-color2)]">
            {userData.role ? userData.role.toUpperCase() : ""}
          </span>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-[var(--font-color2)]" />

        {(userData.role === "admin" || userData.role === "president") && (
          <a href={`/admin/profile/${userData.id}`}>
            <DropdownMenuItem className="flex items-center gap-2 text-[var(--font-color2)] hover:!bg-[var(--hover-color)] hover:!text-white transition-all cursor-pointer">
              <User size={16} className="text-[var(--font-color2)]" />
              <span>Perfil</span>
            </DropdownMenuItem>
          </a>
        )}

        {userData.role === "member" && (
          <a href={`/dashboard/profile/${userData.id}`}>
            <DropdownMenuItem className="flex items-center gap-2 text-[var(--font-color2)] hover:!bg-[var(--hover-color)] hover:!text-white transition-all cursor-pointer">
              <User size={16} className="text-[var(--font-color2)]" />
              <span>Perfil</span>
            </DropdownMenuItem>
          </a>
        )}

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
