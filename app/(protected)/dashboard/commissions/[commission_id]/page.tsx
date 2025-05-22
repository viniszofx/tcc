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

interface Route {
  title: string;
  description: string;
  icon: any;
  href: string;
}

interface CommissionPageProps {
  params: Promise<{
    campus_id: string;
    commission_id: string;
  }>;
}

export default async function CommissionPage({ params }: CommissionPageProps) {
  console.log("params", params);
  const resolvedParams = await params;
  const commission = data.commissions.find(
    (c) => c?.id === resolvedParams.commission_id
  );

  if (!commission) {
    return (
      <Card className="w-full max-w-3xl bg-[var(--bg-simple)] lg:max-w-5xl xl:max-w-6xl">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <h2 className="text-xl font-bold text-[var(--font-color)]">
            Comissão não encontrada
          </h2>
          <p className="text-muted-foreground mt-2">
            A comissão solicitada não existe ou foi removida.
          </p>
        </CardContent>
      </Card>
    );
  }

  const routes: Route[] = [
    {
      title: "Inventário",
      description: "Gerenciar itens do inventário",
      icon: Database,
      href: `/dashboard/commissions/${resolvedParams.commission_id}/inventories`,
    },
    {
      title: "Membros",
      description: "Gerenciar membros da comissão",
      icon: Users2,
      href: `/dashboard/commissions/${resolvedParams.commission_id}/members`,
    },
    {
      title: "Relatórios",
      description: "Visualizar e gerar relatatórios",
      icon: FileText,
      href: `/dashboard/commissions/${resolvedParams.commission_id}/reports`,
    },
    {
      title: "Configurações",
      description: "Configurações da comissão",
      icon: Settings,
      href: `/dashboard/commissions/${resolvedParams.commission_id}/settings`,
    },
    {
      title: "Sobre",
      description: "Informações sobre a comissão",
      icon: Info,
      href: `/dashboard/commissions/${resolvedParams.commission_id}/about`,
    },
  ];

  return (
    <Card className="w-full max-w-3xl bg-[var(--bg-simple)] lg:max-w-5xl xl:max-w-6xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold text-[var(--font-color)] md:text-2xl lg:text-3xl">
          {commission.name}
        </CardTitle>
        <CardDescription>{commission.description}</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {routes.map((route) => (
            <Card
              key={route.href}
              className="transition-all hover:bg-[var(--hover-3-color)] group"
            >
              <Link href={route.href} className="block h-full w-full">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <route.icon className="h-5 w-5 text-muted-foreground group-hover:text-muted-foreground/80" />
                    <CardTitle className="text-lg">{route.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{route.description}</CardDescription>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
