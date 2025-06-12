"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import data from "@/data/db.json";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export default function OrganizationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orgId = params.id as string;

  const organization = (data.organizations || []).find(
    (org: any) => org.organizacao_id === orgId
  );

  if (!organization) {
    return (
      <Card className="w-full max-w-3xl bg-[var(--bg-simple)] shadow-lg transition-all duration-300 lg:max-w-5xl xl:max-w-6xl mx-auto mt-12">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <h2 className="text-xl font-bold text-[var(--font-color)]">
            Organização não encontrada
          </h2>
          <p className="text-muted-foreground mt-2">
            ID: {orgId} não corresponde a nenhuma organização
          </p>
          <p className="text-muted-foreground mt-1">
            IDs válidos: {(data.organizations || []).map(o => o.organizacao_id).join(", ")}
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push("/admin/organizations")}
          >
            Voltar para lista de organizações
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl bg-[var(--bg-simple)] shadow-lg transition-all duration-300 lg:max-w-5xl xl:max-w-6xl mx-auto mt-12">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-bold text-[var(--font-color)]">
              {organization.nome}
            </CardTitle>
            <CardDescription className="text-[var(--font-color)]">
              Sigla: {organization.nome_curto}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="text-[var(--font-color)] transition-all"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <h3 className="font-medium text-[var(--font-color)]">ID da Organização</h3>
            <p className="text-sm text-[var(--font-color)]">
              {organization.organizacao_id}
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-medium text-[var(--font-color)]">Status</h3>
            <p className="text-sm text-[var(--font-color)]">
              {organization.ativo ? "Ativa" : "Inativa"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
