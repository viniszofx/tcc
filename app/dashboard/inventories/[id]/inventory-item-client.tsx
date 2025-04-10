"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { BemCopia } from "@/lib/interface";
import { getProcessedData } from "@/utils/data-storage";
import { formatDate } from "@/utils/data-utils";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { JSX, useEffect, useState } from "react";

interface InventoryItemClientProps {
  id: string;
}

export default function InventoryItemClient({
  id,
}: InventoryItemClientProps): JSX.Element {
  const router = useRouter();
  const [item, setItem] = useState<BemCopia | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadItem() {
      setLoading(true);
      try {
        const { data } = await getProcessedData();
        const foundItem = data.find(
          (item) => item.bem_id === id || item.NUMERO === id
        );

        if (foundItem) {
          setItem(foundItem);
        } else {
          router.push("/dashboard/inventories");
        }
      } catch (error) {
        console.error("Error loading item:", error);
        router.push("/dashboard/inventories");
      } finally {
        setLoading(false);
      }
    }

    loadItem();
  }, [id, router]);

  if (loading) {
    return (
      <Card className="w-full max-w-3xl bg-[var(--bg-simple)] shadow-md lg:max-w-5xl xl:max-w-6xl mx-auto">
        <CardContent className="p-8 flex justify-center items-center">
          <div className="animate-pulse flex flex-col gap-4 w-full">
            <div className="h-8 bg-[var(--card-color)] rounded w-1/3"></div>
            <div className="h-6 bg-[var(--card-color)] rounded w-full"></div>
            <div className="h-40 bg-[var(--card-color)] rounded w-full"></div>
            <div className="h-40 bg-[var(--card-color)] rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!item) {
    return (
      <Card className="w-full max-w-3xl bg-[var(--bg-simple)] shadow-md lg:max-w-5xl xl:max-w-6xl mx-auto">
        <CardContent className="p-8 text-center">
          <h2 className="text-xl font-bold text-[var(--font-color)]">
            Item não encontrado
          </h2>
          <p className="text-[var(--font-color)]/70 mt-2">
            O item que você está procurando não existe ou foi removido.
          </p>
          <Link href="/dashboard/inventories">
            <Button className="mt-4 bg-[var(--button-color)] text-[var(--font-color2)] hover:bg-[var(--hover-2-color)] hover:text-white">
              Voltar para Inventário
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ATIVO":
      case "Ativo":
        return "bg-green-500";
      case "EM_USO":
      case "Em Manutenção":
        return "bg-amber-500";
      case "BAIXA_SOLICITADA":
      case "Inativo":
        return "bg-gray-500";
      case "BAIXADO":
      case "Baixado":
        return "bg-red-500";
      case "Transferido":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card className="w-full max-w-3xl bg-[var(--bg-simple)] shadow-md lg:max-w-5xl xl:max-w-6xl mx-auto">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Link href="/dashboard/inventories">
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-[var(--font-color)] hover:bg-[var(--hover-2-color)] hover:text-white cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar para Inventário</span>
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="flex items-center gap-2 border-[var(--border-input)] bg-[var(--card-color)] text-[var(--font-color)] hover:bg-[var(--hover-color)] hover:text-white cursor-pointer"
            >
              <Edit className="h-4 w-4" />
              <span>Editar</span>
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2 border-[var(--border-input)] bg-[var(--card-color)] text-red-500 hover:bg-red-500 hover:text-white cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
              <span>Excluir</span>
            </Button>
          </div>
        </div>
        <CardTitle className="mt-4 text-xl font-bold text-[var(--font-color)] md:text-2xl lg:text-3xl">
          {item.DESCRICAO}
          <Badge className={`ml-4 ${getStatusColor(item.STATUS)} text-white`}>
            {item.STATUS}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-[var(--border-input)] bg-[var(--card-color)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-[var(--font-color)]">
                Informações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-[var(--font-color)]">
              <div className="flex justify-between">
                <span className="font-medium">Número:</span>
                <span>{item.NUMERO}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Marca/Modelo:</span>
                <span>{item.MARCA_MODELO}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Estado de Conservação:</span>
                <span>{item.ESTADO_DE_CONSERVACAO}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Última Atualização:</span>
                <span>{formatDate(item.data_ultima_atualizacao)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Atualizado por:</span>
                <span>{item.ultimo_atualizado_por}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[var(--border-input)] bg-[var(--card-color)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-[var(--font-color)]">
                Localização e Responsabilidade
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-[var(--font-color)]">
              <div className="flex justify-between">
                <span className="font-medium">Campus:</span>
                <span>{item.CAMPUS_DA_LOTACAO_DO_BEM}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Sala:</span>
                <span>{item.SALA}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Responsável:</span>
                <span>{item.RESPONSABILIDADE_ATUAL}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Setor:</span>
                <span>{item.SETOR_DO_RESPONSAVEL}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">ED:</span>
                <span>{item.ED}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-[var(--border-input)] bg-[var(--card-color)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-[var(--font-color)]">
              Descrição e Detalhes
            </CardTitle>
          </CardHeader>
          <CardContent className="text-[var(--font-color)]">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">Descrição Principal</h3>
                <p>{item.DESCRICAO_PRINCIPAL || item.DESCRICAO}</p>
              </div>
              <Separator className="bg-[var(--border-input)]" />
              <div>
                <h3 className="font-medium mb-1">Rótulos</h3>
                <p>{item.ROTULOS || "Nenhum rótulo definido"}</p>
              </div>
              {item.observacoes && (
                <>
                  <Separator className="bg-[var(--border-input)]" />
                  <div>
                    <h3 className="font-medium mb-1">Observações</h3>
                    <p>{item.observacoes}</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-[var(--border-input)] bg-[var(--card-color)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-[var(--font-color)]">
              Informações do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-[var(--font-color)]">
            <div className="flex justify-between">
              <span className="font-medium">ID do Bem:</span>
              <span>{item.bem_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">ID do Inventário:</span>
              <span>{item.inventario_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">ID do Grupo:</span>
              <span>{item.grupo_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">ID do Campus:</span>
              <span>{item.campus_id}</span>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
