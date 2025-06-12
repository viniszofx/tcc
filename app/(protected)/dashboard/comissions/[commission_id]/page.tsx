import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import data from "@/data/db.json";
import { Database, FileText, Info, Settings, Users2 } from "lucide-react";
import Link from "next/link";
import type React from "react";

interface Route {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

interface PageProps {
  params: Promise<{
    commission_id: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ComissionPage({ params }: PageProps) {
  const { commission_id } = await params;

  const comission = data.comissoes.find((c) => c.comissao_id === commission_id);

  if (!comission) {
    return (
      <Card className="w-full max-w-3xl bg-[var(--bg-simple)] shadow-lg mx-auto my-12">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <h2 className="text-xl font-bold text-[var(--font-color)]">
            Comissão não encontrada
          </h2>
          <p className="text-muted-foreground mt-2">
            ID: {commission_id} não corresponde a nenhuma comissão ativa
          </p>
          <p className="text-muted-foreground mt-1">
            IDs válidos: {data.comissoes.map((c) => c.comissao_id).join(", ")}
          </p>
        </CardContent>
      </Card>
    );
  }

  const campus = data.campuses.find((c) => c.campus_id === comission.campus_id);
  const presidente = data.users.find((u) => u.usuario_id === comission.presidente_id);

  const routes: Route[] = [
    {
      title: "Inventário",
      description: "Gerenciar itens do inventário",
      icon: Database,
      href: `/admin/comissions/${commission_id}/inventory`,
    },
    {
      title: "Membros",
      description: "Gerenciar membros da comissão",
      icon: Users2,
      href: `/admin/comissions/${commission_id}/members`,
    },
    {
      title: "Relatórios",
      description: "Visualizar e gerar relatórios",
      icon: FileText,
      href: `/admin/comissions/${commission_id}/reports`,
    },
    {
      title: "Configurações",
      description: "Configurações da comissão",
      icon: Settings,
      href: `/admin/comissions/${commission_id}/settings`,
    },
    {
      title: "Sobre",
      description: "Informações sobre a comissão",
      icon: Info,
      href: `/admin/comissions/${commission_id}/about`,
    },
  ];

  return (
    <Card className="w-full max-w-3xl bg-[var(--bg-simple)] shadow-lg transition-all duration-300 lg:max-w-5xl xl:max-w-6xl">
      <CardHeader className="pb-4 text-center">
        <div className="flex flex-col space-y-1.5">
          <CardTitle className="text-xl font-bold text-[var(--font-color)] md:text-2xl lg:text-3xl">
            {comission.nome}
          </CardTitle>
          <CardDescription className="text-sm text-[var(--font-color)] md:text-base">
            {comission.descricao || "Nenhuma descrição fornecida"}
          </CardDescription>
          {campus && (
            <CardDescription className="text-[var(--font-color)]">
              Campus: {campus.nome}
            </CardDescription>
          )}
          {presidente && (
            <CardDescription className="text-[var(--font-color)]">
              Presidente: {presidente.nome}
            </CardDescription>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-col items-center justify-center py-8">
        <div className="grid w-full max-w-3xl grid-cols-1 gap-4 md:grid-cols-2">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className="flex flex-col items-center justify-center gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-color)] px-6 py-6 shadow-sm transition hover:shadow-md hover:bg-[var(--hover-3-color)] group w-full"
            >
              <route.icon
                className="text-[var(--font-color)] group-hover:text-white transition"
              />
              <span className="text-base font-medium text-[var(--font-color)] group-hover:text-white transition text-center">
                {route.title}
              </span>
              <p className="text-sm text-muted-foreground text-center">{route.description}</p>
            </Link>
          ))}
        </div>
      </CardContent>

    </Card>
  );
}
