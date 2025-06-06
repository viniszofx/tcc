# Etapa 1: Builder - Onde a Aplicação é Construída
# Esta etapa instala dependências e compila sua aplicação Next.js.
FROM node:22-alpine AS builder

# Define o diretório de trabalho.
WORKDIR /app

# Ativa o pnpm via corepack para gerenciar pacotes.
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copia apenas os arquivos de dependência para otimizar o cache do Docker.
COPY package.json pnpm-lock.yaml ./

# Instala todas as dependências do projeto.
RUN pnpm install --frozen-lockfile

# Copia o restante do código-fonte do seu projeto.
# O '.dockerignore' é crucial aqui para excluir arquivos desnecessários,
# como o '.env.production' que contém segredos.
COPY . .

# Comando de build do Next.js.
# Neste ponto, se você tiver variáveis NEXT_PUBLIC_ em um .env.production
# (ou injetadas via GitHub Actions), elas serão incorporadas ao bundle do cliente.
RUN pnpm build

# Remove as dependências de desenvolvimento para reduzir o tamanho.
RUN pnpm prune --prod

# Etapa 2: Runner - A Imagem Leve de Produção
# Esta etapa cria a imagem final e otimizada para execução.
FROM node:22-alpine AS runner

WORKDIR /app

# Copia apenas os artefatos essenciais do builder para a imagem final.
# NENHUM arquivo .env sensível é copiado para cá.
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

# Definições de ambiente para o contêiner de produção.
# Variáveis como PORT e NODE_ENV são seguras para definir aqui.
ENV NODE_ENV=production
ENV PORT=8000

# Expõe a porta 8000.
EXPOSE 8000

# Boas práticas de segurança: Executa a aplicação como um usuário não-root.
RUN addgroup --system --gid 1001 nodejs && \
  adduser --system --uid 1001 nextjs && \
  chown -R nextjs:nodejs /app
USER nextjs

# Comando para iniciar a aplicação Next.js em modo de produção.
CMD ["node_modules/.bin/next", "start", "-p", "8000", "-H", "0.0.0.0"]