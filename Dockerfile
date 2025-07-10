# syntax=docker/dockerfile:1.4

# Etapa 1: Builder - Onde a Aplicação é Construída
FROM node:22-alpine AS builder

WORKDIR /app

# Instalar dependências do sistema necessárias
RUN apk add --no-cache libc6-compat

# Configurar pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copiar arquivos de configuração de dependências e schema do Prisma
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma

# Limpar cache e instalar dependências
RUN pnpm store prune
RUN pnpm install --frozen-lockfile

# Copiar código fonte
COPY . .

# Variáveis de ambiente para build
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG SUPABASE_SERVICE_ROLE_KEY
ARG DATABASE_URL
ARG NEXT_PUBLIC_BASE_URL

# Definir as variáveis como ENV para que o Next.js as leia durante o build
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY
ENV DATABASE_URL=$DATABASE_URL
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL

# Configurar ambiente de produção para o build
ENV NODE_ENV=production
ENV CI=true
ENV SKIP_PREBUILD=true

# Executar o build do Next.js
RUN pnpm build

# Remover dependências de desenvolvimento
RUN pnpm prune --prod

# Etapa 2: Runner - A Imagem Leve de Produção
FROM node:22-alpine AS runner

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

# Copiar os arquivos necessários do builder
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Definições de ambiente para o contêiner de produção
ENV NODE_ENV=production
ENV PORT=8000

EXPOSE 8000

RUN addgroup --system --gid 1001 nodejs && \
  adduser --system --uid 1001 nextjs && \
  chown -R nextjs:nodejs /app
USER nextjs

CMD ["node_modules/.bin/next", "start", "-p", "8000", "-H", "0.0.0.0"]