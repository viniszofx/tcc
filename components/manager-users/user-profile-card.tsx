"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface UserProfileCardProps {
  usuario: {
    nome: string;
    papel?: string;
    descricao?: string;
    active: boolean;
    perfil?: {
      imagem_url?: string;
      descricao?: string;
    };
  };
}

export function UserProfileCard({ usuario }: UserProfileCardProps) {
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-blue-500 hover:bg-blue-600";
      case "presidente":
        return "bg-green-500 hover:bg-green-600";
      case "operador":
        return "bg-amber-500 hover:bg-amber-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  return (
    <Card className="border-[var(--border-color)] bg-[var(--bg-simple)]">
  <CardContent className="p-6">
    <div className="flex flex-col md:flex-row md:items-center gap-6">
      <Avatar className="h-24 w-24 border mx-auto md:mx-0">
        <AvatarImage
          src={usuario.perfil?.imagem_url || "/placeholder.svg"}
          alt={usuario.nome}
        />
        <AvatarFallback className="text-2xl">
          {usuario.nome.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col items-center md:items-start gap-2">
        <h2 className="text-2xl font-bold text-[var(--font-color)]">
          {usuario.nome}
        </h2>
        <Badge
          className={`${getRoleBadgeColor(
            usuario.papel || "usuario"
          )} text-white`}
        >
          {(usuario.papel || "USUÁRIO").toUpperCase()}
        </Badge>
        <span
          className={`inline-flex rounded px-2 py-1 text-xs font-medium text-white ${
            usuario.active ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {usuario.active ? "Ativo" : "Inativo"}
        </span>
        {usuario.perfil?.descricao && (
          <p className="text-sm text-[var(--font-color)] opacity-80 mt-2 text-center md:text-left">
            {usuario.perfil.descricao}
          </p>
        )}
      </div>
    </div>
  </CardContent>
</Card>
  );
}
