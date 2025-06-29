"use client";

import LoadingScreen from "@/components/custom/loading";
import { EditComissionModal } from "@/components/manager-comissions/edit-comission-modal";
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
import type {
  Campus,
  Commission,
  CommissionMember,
  UserProfile,
} from "@/interface";
import {
  ArrowLeft,
  Clock,
  Database,
  Edit,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ComissionDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const comissionId = params.commission_id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [comissao, setComissao] = useState<Commission | null>(null);
  const [campus, setCampus] = useState<Campus | null>(null);
  const [commissionMembers, setCommissionMembers] = useState<
    CommissionMember[]
  >([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);

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

          // Buscar o campus da comissão
          const campusResponse = await fetch(
            `/api/campus?id=${commissionData.campusId}`
          );
          const campusData = await campusResponse.json();
          if (campusResponse.ok) {
            setCampus(campusData);
          }

          // Buscar membros da comissão
          const membersResponse = await fetch(
            `/api/commission-member?commissionId=${comissionId}`
          );
          const membersData = await membersResponse.json();
          if (membersResponse.ok) {
            setCommissionMembers(membersData);
          }

          // Buscar todos os usuários
          const usersResponse = await fetch("/api/user");
          const usersData = await usersResponse.json();
          if (usersResponse.ok) {
            setUsers(usersData);
          }
        } else {
          console.error("Comissão não encontrada");
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [comissionId]);

  const presidente = commissionMembers.find(
    (member) => member.roleInCommission === "Presidente"
  );
  const presidenteUser = presidente
    ? users.find((user) => user.id === presidente.userId)
    : null;

  const membros = commissionMembers
    .map((member) => users.find((user) => user.id === member.userId))
    .filter(Boolean);

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
            Comissão com ID: {comissionId} não foi encontrada
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

  const handleSave = async (updatedComission: Commission) => {
    try {
      const response = await fetch("/api/commission", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedComission),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setComissao(updatedData);
        setIsEditModalOpen(false);
      } else {
        console.error("Erro ao atualizar comissão");
      }
    } catch (error) {
      console.error("Erro ao atualizar comissão:", error);
    }
  };

  const handleAskDelete = () => {
    setShowConfirm(true);
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/commission?id=${comissionId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/admin/comissions");
      } else {
        console.error("Erro ao deletar comissão");
      }
    } catch (error) {
      console.error("Erro ao deletar comissão:", error);
    }
    setShowConfirm(false);
  };

  return (
    <>
      <Card className="w-full max-w-3xl bg-[var(--bg-simple)] shadow-lg transition-all duration-300 lg:max-w-5xl xl:max-w-6xl">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-[var(--font-color)]">
                {comissao.name}
              </CardTitle>
              <CardDescription className="text-[var(--font-color)]">
                {campus?.name} • {comissao.type}
              </CardDescription>
            </div>
            <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:flex-row sm:w-auto sm:gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/admin/comissions")}
                className="text-[var(--font-color)] transition-all w-full sm:w-auto"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditModalOpen(true)}
                className="text-[var(--font-color)] w-full sm:w-auto"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAskDelete}
                className="text-red-500 hover:text-red-700 w-full sm:w-auto"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
              <Link
                href={`/admin/comissions/${comissionId}/history`}
                className="w-full sm:w-auto"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="text-[var(--font-color)] w-full sm:w-auto"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Histórico
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <h3 className="font-medium text-[var(--font-color)]">
                Descrição
              </h3>
              <p className="text-sm text-[var(--font-color)]">
                {comissao.description || "Nenhuma descrição fornecida"}
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium text-[var(--font-color)]">
                Presidente
              </h3>
              <p className="text-sm text-[var(--font-color)]">
                {presidenteUser?.name || "Não definido"}
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium text-[var(--font-color)]">Status</h3>
              <p className="text-sm text-[var(--font-color)]">
                {comissao.active ? "Ativa" : "Inativa"} • Ano: {comissao.year}
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium text-[var(--font-color)]">Membros</h3>
              <p className="text-sm text-[var(--font-color)]">
                {membros.length} membro{membros.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-4">
            <Link
              href={`/admin/comissions/${comissionId}/members`}
              className="flex-1 min-w-[200px]"
            >
              <Button className="w-full gap-2 bg-[var(--button-color)] text-[var(--font-color2)] hover:bg-[var(--hover-2-color)]">
                <Users className="h-4 w-4" />
                Gerenciar Membros
              </Button>
            </Link>
            <Link
              href={`/admin/comissions/${comissionId}/upload`}
              className="flex-1 min-w-[200px]"
            >
              <Button className="w-full gap-2 bg-[var(--button-color)] text-[var(--font-color2)] hover:bg-[var(--hover-2-color)]">
                <Upload className="h-4 w-4" />
                Fazer Upload do Arquivo
              </Button>
            </Link>
            <Link
              href={`/admin/comissions/${comissionId}/inventories`}
              className="flex-1 min-w-[200px]"
            >
              <Button className="w-full gap-2 bg-[var(--button-color)] text-[var(--font-color2)] hover:bg-[var(--hover-2-color)]">
                <Database className="h-4 w-4" />
                Acessar inventário
              </Button>
            </Link>
          </div>
        </CardContent>
        <EditComissionModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSave}
          onDelete={handleAskDelete}
          comissao={comissao}
        />
      </Card>

      {/* Modal de confirmação de exclusão */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="sm:max-w-md max-w-[95vw] p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-[var(--font-color)]">
              Confirmar Exclusão
            </DialogTitle>
            <DialogDescription className="text-[var(--font-color)]/70">
              Tem certeza que deseja excluir a comissão
              <span className="font-semibold text-[var(--font-color)]">
                {" "}
                {comissao?.name}{" "}
              </span>
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
              onClick={handleDelete}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
