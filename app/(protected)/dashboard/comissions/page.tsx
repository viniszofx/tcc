import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import data from "@/data/db.json";
import Link from "next/link";

interface PageProps {
  params: {
    campus_id?: string;
  };
  searchParams?: Record<string, string | string[] | undefined>;
}

export default function ComissionsPage({ params }: any) {
  const campus_id = params.campus_id || "corumba";
  const comissoes = data.comissoes.filter(
    (comissao) => comissao.campus_id === campus_id
  );

  const campus = data.campuses.find((campus) => campus.campus_id === campus_id);
  const campusName = campus ? campus.nome : "Câmpus";

  if (comissoes.length === 0) {
    return (
      <Card className="w-full max-w-3xl bg-[var(--bg-simple)]">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <h2 className="text-xl font-bold text-[var(--font-color)]">
            Nenhuma comissão encontrada
          </h2>
          <p className="text-muted-foreground mt-2">
            Não há comissões cadastradas para este campus
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl bg-[var(--bg-simple)] shadow-lg transition-all duration-300 lg:max-w-5xl xl:max-w-6xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold text-[var(--font-color)] md:text-2xl lg:text-3xl">
          Comissões
        </CardTitle>
        <CardDescription className="text-[var(--font-color)]">
          Lista de comissões do {campusName}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        <div className="grid gap-6 md:grid-cols-2">
          {comissoes.map((comissao) => (
            <Card
              key={comissao.comissao_id}
              className="border-[var(--border-color)] bg-[var(--bg-simple)]"
            >
              <CardHeader>
                <CardTitle className="text-[var(--font-color)]">
                  {comissao.nome}
                </CardTitle>
                <CardDescription className="text-[var(--font-color)]">
                  Tipo: {comissao.tipo} | Ano: {comissao.ano}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[var(--font-color)]">
                  {comissao.descricao || "Sem descrição"}
                </p>
                <p className="text-sm text-[var(--font-color)] mt-2">
                  Status: {comissao.ativo ? "Ativa" : "Inativa"}
                </p>
              </CardContent>
              <CardFooter>
                <Link
                  href={`/dashboard/comissions/${comissao.comissao_id}`}
                  className="w-full"
                >
                  <Button className="w-full text-[var(--font-color2)] bg-[var(--button-color)] hover:bg-[var(--hover-3-color)]">
                    Ver Comissão
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
