import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sobre o Sistema - KDÊ",
  description: "Informações sobre o sistema de gestão acadêmica.",
};

export default function AboutPage() {
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-[var(--font-color)]">Sobre o Sistema</h1>

        <div className="grid gap-6">
          <div className="bg-[var(--bg-simple)] rounded-lg shadow p-6 border border-[var(--border-color)]">
            <h2 className="text-xl font-semibold mb-4">
              Sistema de Gestão Acadêmica
            </h2>
            <p className="text-[var(--font-color)] mb-4">
              Este sistema foi desenvolvido como projeto de Trabalho de
              Conclusão de Curso (TCC) para gerenciar organizações acadêmicas,
              campus e comissões.
            </p>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Principais Funcionalidades</h3>
                <ul className="text-sm text-[var(--font-color)] space-y-1 ml-4">
                  <li>• Gestão de usuários e permissões baseada em roles (CASL)</li>
                  <li>• Administração de organizações e campus</li>
                  <li>• Gerenciamento de comissões e membros</li>
                  <li>• Sistema de inventário integrado com QR Code</li>
                  <li>• Interface responsiva e moderna</li>
                  <li>• Autenticação segura com Supabase</li>
                  <li>• Geração de relatórios em PDF</li>
                  <li>• Upload e processamento de arquivos</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-[var(--bg-simple)] rounded-lg shadow p-6 border border-[var(--border-color)]">
            <h2 className="text-xl font-semibold mb-4">
              Tecnologias Utilizadas
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2">Frontend</h3>
                <ul className="text-sm text-[var(--font-color)] space-y-1">
                  <li>• Next.js 15.2.4</li>
                  <li>• React 19</li>
                  <li>• TypeScript 5.8</li>
                  <li>• Tailwind CSS 4</li>
                  <li>• Shadcn/ui</li>
                  <li>• React Query (TanStack)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium mb-2">Backend</h3>
                <ul className="text-sm text-[var(--font-color)] space-y-1">
                  <li>• Next.js 15 App Router</li>
                  <li>• Prisma ORM 6.10</li>
                  <li>• Supabase</li>
                  <li>• PostgreSQL</li>
                  <li>• Middleware de Autenticação</li>
                  <li>• API Routes com TypeScript</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-[var(--bg-simple)] rounded-lg shadow p-6 border border-[var(--border-color)]">
            <h2 className="text-xl font-semibold mb-4">
              Recursos do Next.js 15
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Novidades Implementadas</h3>
                <ul className="text-sm text-[var(--font-color)] space-y-1 ml-4">
                  <li>• App Router com layouts aninhados</li>
                  <li>• Server Components para melhor performance</li>
                  <li>• Streaming e Suspense boundaries</li>
                  <li>• Middleware otimizado para autenticação</li>
                  <li>• Turbopack para desenvolvimento mais rápido</li>
                  <li>• React 19 com novas funcionalidades</li>
                  <li>• TypeScript 5.8 com melhor inferência</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-[var(--bg-simple)] rounded-lg shadow p-6 border border-[var(--border-color)]">
            <h2 className="text-xl font-semibold mb-4">
              Informações do Sistema
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2">Versão</h3>
                <p className="text-sm text-[var(--font-color)]">1.0.0</p>
              </div>

              <div>
                <h3 className="font-medium mb-2">Última Atualização</h3>
                <p className="text-sm text-[var(--font-color)]">
                  {new Date().toLocaleDateString("pt-BR")}
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-2">Ambiente</h3>
                <p className="text-sm text-[var(--font-color)]">Produção</p>
              </div>

              <div>
                <h3 className="font-medium mb-2">Status</h3>
                <p className="text-sm text-green-600">✓ Operacional</p>
              </div>
            </div>
          </div>

          <div className="bg-[var(--bg-simple)] rounded-lg shadow p-6 border border-[var(--border-color)]">
            <h2 className="text-xl font-semibold mb-4">
              Performance e Otimizações
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Melhorias de Performance</h3>
                <ul className="text-sm text-[var(--font-color)] space-y-1 ml-4">
                  <li>• Carregamento otimizado com Server Components</li>
                  <li>• Cache inteligente de dados com React Query</li>
                  <li>• Lazy loading de componentes e rotas</li>
                  <li>• Compressão automática de assets</li>
                  <li>• Otimização de imagens com next/image</li>
                  <li>• Bundle splitting automático</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-[var(--bg-simple)] rounded-lg shadow p-6 border border-[var(--border-color)]">
            <h2 className="text-xl font-semibold mb-4">Suporte</h2>
            <p className="text-[var(--font-color)] mb-4">
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
              <p className="text-sm">
                <span className="font-medium">Repositório:</span> Sistema desenvolvido com Next.js 15
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
