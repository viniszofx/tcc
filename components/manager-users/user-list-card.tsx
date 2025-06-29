"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Campus, CampusMember, UserProfile } from "@/interface";
import { Eye, Pencil } from "lucide-react";
import Link from "next/link";

interface UserListCardProps {
  users: UserProfile[];
  campusMembers?: CampusMember[];
  campus?: Campus[];
  onEditUser: (user: UserProfile) => void;
}

export function UserListCard({
  users,
  onEditUser,
  campus,
  campusMembers,
}: UserListCardProps) {
  const getRoleBadgeColor = (active: string) => {
    switch (active) {
      case "ativo":
        return "bg-green-500 hover:bg-green-600";
      case "inativo":
        return "bg-red-500 hover:bg-red-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  return (
    <Card className="border-[var(--border-color)] bg-[var(--bg-simple)]">
      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-lg font-medium text-[var(--font-color)]">
          Lista de Usuários
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="rounded-md border border-[var(--border-color)]">
          <div className="grid grid-cols-12 gap-2 bg-[var(--header-color)] p-4 font-medium text-[var(--font-color)]">
            <div className="hidden md:block md:col-span-1 text-center">
              Foto
            </div>
            <div className="col-span-6 md:col-span-3 lg:col-span-2">Nome</div>
            <div className="hidden md:block md:col-span-4 lg:col-span-3">
              Email
            </div>
            <div className="hidden lg:block lg:col-span-2">Campus</div>
            <div className="hidden lg:block lg:col-span-2">Status</div>
            <div className="col-span-6 md:col-span-4 lg:col-span-2 text-right">
              Ações
            </div>
          </div>

          <div className="divide-y divide-[var(--border-color)]">
            {users.length > 0 ? (
              users.map((usuario) => (
                <div
                  key={usuario.id}
                  className="grid grid-cols-12 items-center gap-2 p-4 text-[var(--font-color)]"
                >
                  <div className="hidden md:flex md:col-span-1 justify-center">
                    <Avatar className="h-10 w-10 border">
                      <AvatarImage
                        src={usuario.avatar || "/placeholder.svg"}
                        alt={usuario.name}
                      />
                      <AvatarFallback>{usuario.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="col-span-6 md:col-span-3 lg:col-span-2 truncate">
                    {usuario.name}
                  </div>

                  <div className="hidden md:block md:col-span-4 lg:col-span-3 truncate">
                    {usuario.email}
                  </div>

                  <div className="hidden lg:block lg:col-span-2 truncate">
                    {(usuario as any).campusName || "Sem campus"}
                  </div>

                  <div className="hidden lg:block lg:col-span-2">
                    <span
                      className={`inline-flex rounded px-2 py-1 text-xs font-medium text-white ${
                        usuario.active ? "bg-green-500" : "bg-red-500"
                      }`}
                    >
                      {usuario.active ? "Ativo" : "Inativo"}
                    </span>
                  </div>

                  <div className="col-span-6 md:col-span-4 lg:col-span-2 flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 border-[var(--border-color)] hover:bg-[var(--hover-3-color)]"
                      onClick={() => onEditUser(usuario)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Link href={`/admin/users/${usuario.id}`}>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-[var(--border-color)] hover:bg-[var(--hover-3-color)]"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-[var(--font-color)]">
                Nenhum usuário encontrado
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
