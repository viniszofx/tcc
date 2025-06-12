"use client";

import AddMemberModal from "@/components/members/add-member-modal";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import data from "@/data/db.json";
import type { Comissao, Usuario } from "@/lib/interface";
import { ArrowLeft, Plus, Trash2, Users } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ComissionMembersPage() {
  const router = useRouter();
  const params = useParams();
  const comissionId = params.commission_id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [comissao, setComissao] = useState<Comissao | null>(null);
  const [membros, setMembros] = useState<Usuario[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = () => {
      try {
        const comissaoEncontrada = data.comissoes.find(
          (c: Comissao) => c.comissao_id === comissionId && c.ativo !== false
        );

        if (comissaoEncontrada) {
          setComissao(comissaoEncontrada);

          const membrosComissao = data.users.filter(
            (u: Usuario) => u.comissao_id === comissionId
          );

          const membrosUnicos = Array.from(new Map(
            membrosComissao.map(membro => [membro.usuario_id, membro])
          ).values());

          setMembros(membrosUnicos);
        } else {
          console.error("Comissão não encontrada ou inativa");
        }
      } catch (error) {
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

  const handleRemoveMember = (memberId: string) => {
    setMembros(membros.filter(m => m.usuario_id !== memberId));
    console.log(`Membro removido: ${memberId}`);
  };

  const handleAddNewMember = (userId: string, role: string) => {
    const userToAdd = data.users.find(u => u.usuario_id === userId);

    if (userToAdd) {
      const alreadyMember = membros.some(m => m.usuario_id === userId);

      if (alreadyMember) {
        alert("Este usuário já é membro da comissão");
        return;
      }

      const newMember = {
        ...userToAdd,
        comissao_id: comissionId,
        papel: role
      };

      setMembros([...membros, newMember]);
      setIsAddModalOpen(false);
      console.log(`Novo membro adicionado: ${userId} como ${role}`);
    }
  };

  if (isLoading) {
    return <div>Carregando...</div>;
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
                Membros da Comissão: {comissao.nome}
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
                  key={`${membro.usuario_id}-${membro.comissao_id}`}
                  className="flex items-center justify-between p-4 border rounded-lg bg-[var(--card-color)] shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative h-12 w-12 rounded-full overflow-hidden">
                      <Image
                        src={membro.perfil?.imagem_url || "/logo.svg"}
                        alt={`Foto de ${membro.nome}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-[var(--font-color)]">
                        {membro.nome}
                      </h3>
                      <p className="text-sm text-muted-foreground capitalize">
                        {membro.papel}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveMember(membro.usuario_id)}
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

      <AddMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddNewMember}
        commissionId={comissionId}
        currentMembers={membros.map(m => m.usuario_id)}
      />
    </>
  );
}