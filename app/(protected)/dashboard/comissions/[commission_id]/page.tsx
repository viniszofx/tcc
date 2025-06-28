"use client";

import LoadingScreen from "@/components/custom/loading";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import data from "@/data/new-db.json";
import { Clock, Database } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ComissionPage() {
  const params = useParams();
  const commission_id = params.commission_id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [comission, setComission] = useState(() =>
    data.commissions.find((c) => c.id === commission_id)
  );

  useEffect(() => {
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

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
        </CardContent>
      </Card>
    );
  }

  const campus = data.campus.find((c) => c.id === comission.campusId);

  // Busca o presidente da comissão
  const presidenteMember = data.commission_members.find(
    (member) =>
      member.commissionId === commission_id &&
      member.roleInCommission === "Presidente"
  );
  const presidente = presidenteMember
    ? data.user_profiles.find((user) => user.id === presidenteMember.userId)
    : null;

  const routes = [
    {
      title: "Inventário",
      description: "Gerenciar itens do inventário",
      icon: Database,
      href: `/dashboard/comissions/${commission_id}/inventories`,
    },
    {
      title: "Histórico",
      description: "Visualizar Histórico do inventário",
      icon: Clock,
      href: `/dashboard/comissions/${commission_id}/history`,
    },
  ];

  return (
    <Card className="w-full max-w-3xl bg-[var(--bg-simple)] shadow-lg transition-all duration-300 lg:max-w-5xl xl:max-w-6xl">
      <CardHeader className="pb-4 text-center">
        <CardTitle className="text-xl font-bold text-[var(--font-color)] md:text-2xl lg:text-3xl">
          {comission.name}
        </CardTitle>
        <CardDescription className="text-sm text-[var(--font-color)]">
          {comission.description || "Nenhuma descrição fornecida"}
        </CardDescription>
        {campus && (
          <CardDescription className="text-[var(--font-color)]">
            Campus: {campus.name}
          </CardDescription>
        )}
        {presidente && (
          <CardDescription className="text-[var(--font-color)]">
            Presidente: {presidente.name}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="flex flex-col items-center justify-center py-8">
        <div className="grid w-full max-w-3xl grid-cols-1 gap-4 md:grid-cols-2">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className="flex flex-col items-center justify-center gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-color)] px-6 py-6 shadow-sm transition hover:shadow-md hover:bg-[var(--hover-3-color)] group w-full"
            >
              <route.icon className="text-[var(--font-color)] group-hover:text-white transition" />
              <span className="text-base font-medium text-[var(--font-color)] group-hover:text-white transition text-center">
                {route.title}
              </span>
              <p className="text-sm text-muted-foreground text-center">
                {route.description}
              </p>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
