"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserPermissions } from "@/hooks/use-user-permissions";
import type { Campus, CampusMember, UserProfile } from "@/interface";
import {
  Crown,
  Eye,
  MoreVertical,
  Pencil,
  Trash2,
  User,
  UserMinus,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface UserListCardProps {
  users: UserProfile[];
  campusMembers?: CampusMember[];
  campus?: Campus[];
  onEditUser: (user: UserProfile) => void;
  onDeleteUser?: (user: UserProfile) => void;
  onRemoveFromCommission?: (user: UserProfile, commissionId: string) => void;
}

export function UserListCard({
  users,
  onEditUser,
  onDeleteUser,
  onRemoveFromCommission,
}: UserListCardProps) {
  const { canDeleteUsers, canRemoveFromCommissions, presidedCommissions } =
    useUserPermissions();
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);

  const handleDeleteClick = async (user: UserProfile) => {
    if (!onDeleteUser || !canDeleteUsers) return;

    const confirmMessage = `Tem certeza que deseja EXCLUIR DEFINITIVAMENTE o usuário "${user.name}"?\n\nEsta ação irá remover:\n- O usuário do sistema\n- Todas suas associações com campus\n- Todas suas associações com comissões\n- Todas suas associações com organizações\n\nEsta ação não pode ser desfeita.`;

    if (confirm(confirmMessage)) {
      setDeletingUserId(user.id);
      try {
        await onDeleteUser(user);
      } finally {
        setDeletingUserId(null);
      }
    }
  };

  const handleRemoveFromCommissionClick = async (
    user: UserProfile,
    commissionId: string
  ) => {
    if (!onRemoveFromCommission || !canRemoveFromCommissions) return;

    const confirmMessage = `Tem certeza que deseja REMOVER "${user.name}" da comissão?\n\nEsta ação irá:\n- Remover o usuário da comissão\n- Remover suas permissões nesta comissão\n- Manter o usuário no sistema (não exclui o usuário)\n\nEsta ação não pode ser desfeita.`;

    if (confirm(confirmMessage)) {
      setRemovingUserId(user.id);
      try {
        await onRemoveFromCommission(user, commissionId);
      } finally {
        setRemovingUserId(null);
      }
    }
  };

  // Verificar se o usuário pode ser removido de alguma comissão presidida
  const canRemoveUserFromCommissions = (user: UserProfile) => {
    if (!canRemoveFromCommissions) return [];

    const userWithRelations = user as any;
    if (!userWithRelations.commissionMembers) return [];

    return userWithRelations.commissionMembers.filter((member: any) =>
      presidedCommissions.includes(member.commissionId)
    );
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
            <div className="hidden md:block md:col-span-4 lg:col-span-2">
              Email
            </div>
            <div className="hidden lg:block lg:col-span-2">Campus</div>
            <div className="hidden lg:block lg:col-span-2">Papel</div>
            <div className="hidden lg:block lg:col-span-1">Status</div>
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

                  <div className="hidden md:block md:col-span-4 lg:col-span-2 truncate">
                    {usuario.email}
                  </div>

                  <div className="hidden lg:block lg:col-span-2 truncate">
                    {(usuario as any).campusName || "Sem campus"}
                  </div>

                  <div className="hidden lg:block lg:col-span-2 truncate">
                    {(usuario as any).organizationMembers?.length > 0 ? (
                      (usuario as any).organizationMembers[0].role === "admin global" ? (
                        <span className="flex items-center gap-1">
                          <Crown className="w-4 h-4 text-purple-600" /> Admin Global
                        </span>
                      ) : (usuario as any).organizationMembers[0].role === "admin" ? (
                        <span className="flex items-center gap-1">
                          <Crown className="w-4 h-4 text-yellow-600" /> Admin
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4 text-blue-600" /> Membro
                        </span>
                      )
                    ) : (
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4 text-blue-600" /> Membro
                      </span>
                    )}
                  </div>

                  <div className="hidden lg:block lg:col-span-1">
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
                    <Link href={`/application/users/${usuario.id}`}>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-[var(--border-color)] hover:bg-[var(--hover-3-color)]"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>

                    {/* Menu de ações baseado nas permissões */}
                    {(canDeleteUsers ||
                      canRemoveUserFromCommissions(usuario).length > 0) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-[var(--border-color)] hover:bg-[var(--hover-3-color)]"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {/* Remover de comissões (presidentes) */}
                          {canRemoveUserFromCommissions(usuario).map(
                            (member: any) => (
                              <DropdownMenuItem
                                key={member.commissionId}
                                onClick={() =>
                                  handleRemoveFromCommissionClick(
                                    usuario,
                                    member.commissionId
                                  )
                                }
                                className="text-orange-600 hover:text-orange-700"
                                disabled={removingUserId === usuario.id}
                              >
                                <UserMinus className="h-4 w-4 mr-2" />
                                Remover de{" "}
                                {member.commission?.name || "Comissão"}
                              </DropdownMenuItem>
                            )
                          )}

                          {/* Excluir usuário (apenas admins) */}
                          {canDeleteUsers && onDeleteUser && (
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(usuario)}
                              className="text-red-600 hover:text-red-700"
                              disabled={deletingUserId === usuario.id}
                            >
                              {deletingUserId === usuario.id ? (
                                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                              ) : (
                                <Trash2 className="h-4 w-4 mr-2" />
                              )}
                              Excluir usuário
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
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
