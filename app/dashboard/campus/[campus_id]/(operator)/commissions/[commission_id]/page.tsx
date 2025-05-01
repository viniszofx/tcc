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
  const resolvedParams = await params;
  const commission = data.commissions.find((c) => c?.id === resolvedParams.commission_id);

  if (!commission) {
    return <div>Comissão não encontrada</div>;
  }

  const routes: Route[] = [
    {
      title: "Inventário",
      description: "Gerenciar itens do inventário",
      icon: Database,
      href: `inventories`,
    },
    {
      title: "Membros",
      description: "Gerenciar membros da comissão",
      icon: Users2,
      href: `manager/users`,
    },
    {
      title: "Relatórios",
      description: "Visualizar e gerar relatatórios",
      icon: FileText,
      href: `reports`,
    },
    {
      title: "Configurações",
      description: "Configurações da comissão",
      icon: Settings,
      href: `settings`,
    },
    {
      title: "Sobre",
      description: "Informações sobre a comissão",
      icon: Info,
      href: `about`,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{commission.name}</h1>
        <p className="text-muted-foreground">{commission.description}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {routes.map((route) => (
          <Card key={route.href}>
            <Link
              href={`/dashboard/campus/${resolvedParams.campus_id}/commissions/${resolvedParams.commission_id}/${route.href}`}
              className="block h-full hover:bg-accent/50 transition-colors"
            >
              <CardHeader>
                <div className="flex items-center gap-2">
                  <route.icon className="h-5 w-5 text-muted-foreground" />
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
    </div>
  );
}
