import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sobre o Sistema | TCC",
  description: "Informações sobre o sistema",
};

export default function AboutPage() {
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Sobre o Sistema</h1>

        <div className="grid gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">
              Sistema de Gestão Acadêmica
            </h2>
            <p className="text-gray-600 mb-4">
              Este sistema foi desenvolvido como projeto de Trabalho de
              Conclusão de Curso (TCC) para gerenciar organizações acadêmicas,
              campus e comissões.
            </p>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Principais Funcionalidades</h3>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>• Gestão de usuários e permissões baseada em roles</li>
                  <li>• Administração de organizações e campus</li>
                  <li>• Gerenciamento de comissões e membros</li>
                  <li>• Sistema de inventário integrado</li>
                  <li>• Interface responsiva e moderna</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">
              Tecnologias Utilizadas
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2">Frontend</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Next.js 14</li>
                  <li>• React 18</li>
                  <li>• TypeScript</li>
                  <li>• Tailwind CSS</li>
                  <li>• Shadcn/ui</li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium mb-2">Backend</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Next.js API Routes</li>
                  <li>• Prisma ORM</li>
                  <li>• Supabase</li>
                  <li>• PostgreSQL</li>
                  <li>• Middleware de Autenticação</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">
              Informações do Sistema
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2">Versão</h3>
                <p className="text-sm text-gray-600">1.0.0</p>
              </div>

              <div>
                <h3 className="font-medium mb-2">Última Atualização</h3>
                <p className="text-sm text-gray-600">
                  {new Date().toLocaleDateString("pt-BR")}
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-2">Ambiente</h3>
                <p className="text-sm text-gray-600">Produção</p>
              </div>

              <div>
                <h3 className="font-medium mb-2">Status</h3>
                <p className="text-sm text-green-600">✓ Operacional</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Suporte</h2>
            <p className="text-gray-600 mb-4">
              Para dúvidas, sugestões ou reportar problemas, entre em contato:
            </p>

            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Email:</span>{" "}
                suporte@sistema.edu.br
              </p>
              <p className="text-sm">
                <span className="font-medium">Documentação:</span> Disponível no
                menu principal
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
