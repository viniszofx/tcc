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
import data from "@/data/new-db.json";
import type { Commission } from "@/lib/new-interface";
import { ArrowLeft, Database, Edit, Trash2, Upload, Users } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ComissionDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const comissionId = params.commission_id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [comissao, setComissao] = useState<Commission | null>(null); // Alterado para armazenar uma única comissão

  useEffect(() => {
    const fetchComissao = () => {
      try {
        const comissaoEncontrada = data.commissions.find(
          (c: Commission) => c.id === comissionId && c.active !== false
        );

        if (comissaoEncontrada) {
          setComissao(comissaoEncontrada);
        } else {
          console.error("Comissão não encontrada ou inativa");
        }
      } catch (error) {
        console.error("Erro ao buscar comissão:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComissao();
  }, [comissionId]);

  console.log("ID recebido:", comissionId);

  const campus = data.campus.find((c) => c.id === comissao?.campusId);

  // Busca o presidente da comissão
  const presidenteMember = data.commission_members.find(
    (member) =>
      member.commissionId === comissionId &&
      member.roleInCommission === "Presidente"
  );
  const presidente = presidenteMember
    ? data.user_profiles.find((user) => user.id === presidenteMember.userId)
    : null;

  // Busca todos os membros da comissão
  const commissionMembers = data.commission_members.filter(
    (member) => member.commissionId === comissionId
  );
  const membros = commissionMembers
    .map((member) =>
      data.user_profiles.find((user) => user.id === member.userId)
    )
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
            ID: {comissionId} não corresponde a nenhuma comissão ativa
          </p>
          <p className="text-muted-foreground mt-1">
            IDs válidos: {data.commissions.map((c) => c.id).join(", ")}
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

  const handleSave = (updatedComission: Commission) => {
    setComissao(updatedComission);
    setIsEditModalOpen(false);
  };

  const handleDelete = () => {
    router.push("/admin/comissions");
  };

  return (
    <Card className="w-full max-w-3xl bg-[var(--bg-simple)] shadow-lg transition-all duration-300 lg:max-w-5xl xl:max-w-6xl">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-bold text-[var(--font-color)]">
              {comissao.name}
            </CardTitle>
            <CardDescription className="text-[var(--font-color)]">
              {campus?.name} • {comissao.type}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/admin/comissions")}
              className="text-[var(--font-color)] transition-all"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
              className="text-[var(--font-color)]"
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <h3 className="font-medium text-[var(--font-color)]">Descrição</h3>
            <p className="text-sm text-[var(--font-color)]">
              {comissao.description || "Nenhuma descrição fornecida"}
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-medium text-[var(--font-color)]">Presidente</h3>
            <p className="text-sm text-[var(--font-color)]">
              {presidente?.name || "Não definido"}
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
        onDelete={handleDelete}
        comissao={comissao}
      />
    </Card>
  );
}
