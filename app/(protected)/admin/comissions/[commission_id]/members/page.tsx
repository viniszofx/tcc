"use client";

import LoadingScreen from "@/components/custom/loading";
import AddMemberModal from "@/components/members/add-member-modal";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Commission, CommissionMember, UserProfile } from "@/interface";
import { ArrowLeft, Plus, Trash2, Users } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ComissionMembersPage() {
  const router = useRouter();
  const params = useParams();
  const comissionId = params.commission_id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [comissao, setComissao] = useState<Commission | null>(null);
  const [membros, setMembros] = useState<
    (UserProfile & { roleInCommission?: string })[]
  >([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);
  const [userToRemove, setUserToRemove] = useState<
    (UserProfile & { roleInCommission?: string }) | null
  >(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar a comissão específica
        const commissionResponse = await fetch(
          `/api/commission?id=${comissionId}`
        );
        const commissionData = await commissionResponse.json();

        if (commissionResponse.ok && commissionData) {
          setComissao(commissionData);

          // Buscar membros da comissão
          const membersResponse = await fetch(
            `/api/commission-member?commissionId=${comissionId}`
          );
          const membersData = await membersResponse.json();

          // Buscar todos os usuários
          const usersResponse = await fetch("/api/user");
          const usersData = await usersResponse.json();

          if (membersResponse.ok && usersResponse.ok) {
            setAllUsers(usersData);

            // Combinar dados dos membros com dados dos usuários
            const membrosDetalhados = membersData
              .map((cm: CommissionMember) => {
                const user = usersData.find(
                  (u: UserProfile) => u.id === cm.userId
                );
                return user
                  ? { ...user, roleInCommission: cm.roleInCommission }
                  : null;
              })
              .filter(Boolean) as (UserProfile & {
              roleInCommission?: string;
            })[];

            setMembros(membrosDetalhados);
          }
        } else {
          setComissao(null);
        }
      } catch (error) {
        setComissao(null);
        console.error("Erro ao buscar dados:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [comissionId]);

  const handleAddMember = () => {
    setIsAddModalOpen(true);
  };

  const handleAskRemove = (
    membro: UserProfile & { roleInCommission?: string }
  ) => {
    setUserToRemove(membro);
    setShowConfirm(true);
  };

  const handleConfirmRemove = async () => {
    if (userToRemove) {
      try {
        const response = await fetch(
          `/api/commission-member?userId=${userToRemove.id}&commissionId=${comissionId}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          setMembros(membros.filter((m) => m.id !== userToRemove.id));
          alert(
            `Membro "${userToRemove.name}" (${
              userToRemove.roleInCommission || "Membro"
            }) removido com sucesso!`
          );
        } else {
          alert("Erro ao remover membro");
        }
      } catch (error) {
        console.error("Erro ao remover membro:", error);
        alert("Erro ao remover membro");
      }

      setShowConfirm(false);
      setUserToRemove(null);
    }
  };

  const handleAddNewMember = async (userId: string, role: string) => {
    const userToAdd = allUsers.find((u) => u.id === userId);

    if (userToAdd) {
      const alreadyMember = membros.some((m) => m.id === userId);

      if (alreadyMember) {
        alert("Este usuário já é membro da comissão");
        return;
      }

      try {
        const response = await fetch("/api/commission-member", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            commissionId: comissionId,
            roleInCommission: role,
          }),
        });

        if (response.ok) {
          const newMember: UserProfile & { roleInCommission?: string } = {
            ...userToAdd,
            roleInCommission: role,
          };

          setMembros([...membros, newMember]);
          setIsAddModalOpen(false);
        } else {
          alert("Erro ao adicionar membro");
        }
      } catch (error) {
        console.error("Erro ao adicionar membro:", error);
        alert("Erro ao adicionar membro");
      }
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!comissao) {
    return (
      <Card className="w-full max-w-3xl bg-[var(--bg-simple)] shadow-lg transition-all duration-300 lg:max-w-5xl xl:max-w-6xl">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <h2 className="text-xl font-bold text-[var(--font-color)]">
            Comissão não encontrada
          </h2>
          <p className="text-muted-foreground mt-2">
            ID: {comissionId} não corresponde a nenhuma comissão ativa
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push("/admin/comissions")}
          >
            Voltar para lista de comissões
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full max-w-3xl bg-[var(--bg-simple)] shadow-lg transition-all duration-300 lg:max-w-5xl xl:max-w-6xl">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold text-[var(--font-color)]">
                Membros da Comissão: {comissao.name}
              </CardTitle>
              <CardDescription className="text-[var(--font-color)]">
                Gerencie os membros desta comissão
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/admin/comissions/${comissionId}`)}
                className="text-[var(--font-color)] transition-all"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
              <Button
                size="sm"
                onClick={handleAddMember}
                className="bg-[var(--button-color)] text-[var(--font-color2)] hover:bg-[var(--hover-2-color)]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Membro
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {membros.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-[var(--font-color)]">
                Nenhum membro encontrado
              </h3>
              <p className="text-muted-foreground mt-2">
                Esta comissão não possui membros cadastrados
              </p>
              <Button
                onClick={handleAddMember}
                className="mt-4 bg-[var(--button-color)] text-[var(--font-color2)] hover:bg-[var(--hover-2-color)]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Membro
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {membros.map((membro) => (
                <div
                  key={`${membro.id}-${comissionId}`}
                  className="flex items-center justify-between p-4 border rounded-lg bg-[var(--card-color)] shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative h-12 w-12 rounded-full overflow-hidden">
                      <Image
                        src={membro.avatar || "/logo.svg"}
                        alt={`Foto de ${membro.name}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-[var(--font-color)]">
                        {membro.name}
                      </h3>
                      <p className="text-sm text-muted-foreground capitalize">
                        {membro.roleInCommission || "Membro"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAskRemove(membro)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="sm:max-w-md max-w-[95vw] p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-[var(--font-color)]">
              Confirmar Exclusão
            </DialogTitle>
            <DialogDescription className="text-[var(--font-color)]/70">
              Tem certeza que deseja excluir o membro
              <span className="font-semibold text-[var(--font-color)]">
                {" "}
                {userToRemove?.name}{" "}
              </span>
              {userToRemove?.roleInCommission && (
                <span className="text-xs text-[var(--font-color)]/70">
                  ({userToRemove.roleInCommission})
                </span>
              )}
              ? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowConfirm(false)}
              className="w-full sm:w-auto text-[var(--font-color)] transition-all"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              className="w-full sm:w-auto bg-red-600 text-white hover:bg-red-700 transition-all"
              onClick={handleConfirmRemove}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddNewMember}
        commissionId={comissionId}
        currentMembers={membros.map((m) => m.id)}
      />
    </>
  );
}
