"use client";

import { DeleteUserDialog } from "@/components/manager-users/delete-user-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserPermissions } from "@/hooks/use-consolidated-user";
import { useCan } from "@/lib/permissions/hooks";
import type { Campus, CampusMember, UserProfile } from '@/types';
import { Crown, Eye, MoreVertical, Pencil, Trash2, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

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
  const { user: currentUser } = useUserPermissions();
  const canUpdateUsers = useCan("update", "User");
  const canDeleteUsers = useCan("delete", "User");
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
  const router = useRouter();

  const handleDeleteClick = (user: UserProfile) => {
    if (!onDeleteUser || !canDeleteUsers) return;
    if (user.role === "admin global") {
      toast.error("Usuários admin global não podem ser excluídos.");
      return;
    }
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete || !onDeleteUser) return;
    
    setDeletingUserId(userToDelete.id);
    setDeleteDialogOpen(false);
    
    try {
      await onDeleteUser(userToDelete);
      toast.success(`Usuário ${userToDelete.name} excluído com sucesso!`);
    } catch (error) {
      toast.error("Erro ao excluir usuário");
    } finally {
      setDeletingUserId(null);
      setUserToDelete(null);
    }
  };

  const getUserSystemRole = (user: UserProfile) => {
    if (user.role === "admin global") {
      return (
        <span className="flex items-center gap-1">
          <Crown className="w-4 h-4 text-purple-600" /> Admin Global
        </span>
      );
    }
    if (user.role === "admin") {
      return (
        <span className="flex items-center gap-1">
          <Crown className="w-4 h-4 text-yellow-600" /> Admin
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1">
        <User className="w-4 h-4 text-blue-600" /> Membro
      </span>
    );
  };

  return (
    <Card className="border-[var(--border-color)] bg-[var(--bg-simple)]">
      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-sm sm:text-base lg:text-lg font-medium text-[var(--font-color)]">
          Lista de Usuários
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="rounded-md border border-[var(--border-color)]">
          <div className="hidden sm:grid grid-cols-10 gap-2 bg-[var(--header-color)] p-4 font-medium text-xs sm:text-sm text-[var(--font-color)]">
            <div className="col-span-1 text-center">Foto</div>
            <div className="col-span-4 truncate">Nome</div>
            <div className="col-span-2 truncate">Papel</div>
            <div className="col-span-2 truncate">Status</div>
            <div className="col-span-1 text-right">Ações</div>
          </div>

          <div className="divide-y divide-[var(--border-color)]">
            {users.length > 0 ? (
              users.map((usuario) => (
                <div
                  key={usuario.id}
                  className="flex flex-col sm:grid sm:grid-cols-10 items-center gap-2 p-4 text-[var(--font-color)]">
                  <div className="hidden sm:flex justify-center col-span-1 w-full sm:w-auto mb-2 sm:mb-0">
                    <Avatar className="h-10 w-10 border">
                      <AvatarImage
                        src={usuario.avatar || "/placeholder.svg"}
                        alt={usuario.name}
                      />
                      <AvatarFallback>{usuario.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="hidden sm:block w-full col-span-4 truncate">
                    <div className="font-medium text-xs sm:text-sm truncate flex items-center gap-2">
                      {usuario.role === "admin global" ? (
                        <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600 flex-shrink-0" />
                      ) : usuario.role === "admin" ? (
                        <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600 flex-shrink-0" />
                      ) : (
                        <User className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
                      )}
                      <span className="truncate">{usuario.name}</span>
                    </div>
                  </div>

                  <div className="hidden sm:block col-span-2 truncate text-xs sm:text-sm">
                    {getUserSystemRole(usuario)}
                  </div>

                  <div className="hidden sm:block col-span-2">
                    <span
                      className={`inline-flex rounded px-2 py-1 text-xs font-medium text-white ${usuario.active ? "bg-green-500" : "bg-red-500"
                        }`}
                    >
                      {usuario.active ? "Ativo" : "Inativo"}
                    </span>
                  </div>

                  <div className="hidden sm:flex justify-end gap-2 w-full col-span-1">
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
                        <DropdownMenuItem onClick={() => router.push(`/application/users/${usuario.id}`)}>
                          <Eye className="h-4 w-4 mr-2" /> Ver mais
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEditUser(usuario)}>
                          <Pencil className="h-4 w-4 mr-2" /> Editar
                        </DropdownMenuItem>
                        {canDeleteUsers &&
                          onDeleteUser &&
                          usuario.role !== "admin global" && (
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
                  </div>

                  <div className="flex flex-col w-full sm:hidden items-center gap-2">
                    <div className="flex items-center w-full gap-3">
                      <Avatar className="h-10 w-10 border">
                        <AvatarImage
                          src={usuario.avatar || "/placeholder.svg"}
                          alt={usuario.name}
                        />
                        <AvatarFallback>{usuario.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {usuario.name}
                        </div>
                        <div className="text-sm text-muted-foreground truncate">
                          {usuario.role === "admin global"
                            ? "Admin Global"
                            : usuario.role === "admin"
                              ? "Admin"
                              : "Membro"}
                        </div>
                      </div>
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
                          <DropdownMenuItem onClick={() => router.push(`/application/users/${usuario.id}`)}>
                            <Eye className="h-4 w-4 mr-2" /> Ver mais
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEditUser(usuario)}>
                            <Pencil className="h-4 w-4 mr-2" /> Editar
                          </DropdownMenuItem>
                          {canDeleteUsers &&
                            onDeleteUser &&
                            usuario.role !== "admin global" && (
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
                    </div>
                    <div className="w-full flex justify-between mt-1">
                      <span
                        className={`inline-flex rounded px-2 py-1 text-xs font-medium text-white ${usuario.active ? "bg-green-500" : "bg-red-500"
                          }`}
                      >
                        {usuario.active ? "Ativo" : "Inativo"}
                      </span>
                    </div>
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
      
      {/* Dialog de confirmação de exclusão */}
      <DeleteUserDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setUserToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        userName={userToDelete?.name || ""}
      />
    </Card>
  );
}
