import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import data from "@/data/db.json"
import { Database, FileText, Info, Settings, Users2 } from "lucide-react"
import Link from "next/link"
import type React from "react"

interface Route {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  href: string
}

interface PageProps {
  params: Promise<{
    commission_id: string
  }>
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function ComissionPage({ params }: PageProps) {
  // Aguarda os parâmetros assíncronos
  const { commission_id } = await params

  const comission = data.comissoes.find((c) => c.comissao_id === commission_id)

  if (!comission) {
    return (
      <Card className="w-full max-w-3xl bg-[var(--bg-simple)] mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <h2 className="text-xl font-bold text-[var(--font-color)]">Comissão não encontrada</h2>
          <p className="text-muted-foreground mt-2">ID: {commission_id} não corresponde a nenhuma comissão ativa</p>
          <p className="text-muted-foreground mt-1">
            IDs válidos: {data.comissoes.map((c) => c.comissao_id).join(", ")}
          </p>
        </CardContent>
      </Card>
    )
  }

  // Encontrar o campus relacionado à comissão
  const campus = data.campuses.find((c) => c.campus_id === comission.campus_id)

  // Encontrar o presidente da comissão
  const presidente = data.users.find((u) => u.usuario_id === comission.presidente_id)

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
  ]

  return (
    <div className="container mx-auto px-4 py-6">
      <Card className="bg-[var(--bg-simple)] border-[var(--border-color)]">
        <CardHeader className="pb-4">
          <div className="flex flex-col space-y-1.5">
            <CardTitle className="text-2xl font-semibold text-[var(--font-color)]">{comission.nome}</CardTitle>
            <CardDescription className="text-[var(--font-color)]">
              {comission.descricao || "Nenhuma descrição fornecida"}
            </CardDescription>
            {campus && <CardDescription className="text-[var(--font-color)]">Campus: {campus.nome}</CardDescription>}
            {presidente && (
              <CardDescription className="text-[var(--font-color)]">Presidente: {presidente.nome}</CardDescription>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {routes.map((route) => (
              <Link key={route.href} href={route.href} passHref>
                <Card className="hover:bg-[var(--hover-color)] transition-colors cursor-pointer h-full">
                  <CardContent className="p-6 flex flex-col items-start">
                    <div className="flex items-center gap-3 mb-3">
                      <route.icon className="h-5 w-5 text-[var(--font-color)]" />
                      <h3 className="text-lg font-medium text-[var(--font-color)]">{route.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{route.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
