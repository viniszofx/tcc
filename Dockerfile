# syntax=docker/dockerfile:1.4
# A linha 'syntax' é CRUCIAL para habilitar recursos do Buildx como o --mount.

# Etapa 1: Builder - Onde a Aplicação é Construída
FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# Variáveis NEXT_PUBLIC_ podem ser definidas como ARGs ou passadas como ENV no build.
# Aqui vamos usar ARGs para as NEXT_PUBLIC_, e os secrets para as "super keys".
# Isso é uma melhor prática para NEXT_PUBLIC_, que são conhecidas no build.
ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY

# Defina as ARGs como ENV para que o Next.js as leia durante o build.
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY


# Executa o build do Next.js.
# AQUI USAMOS --mount=type=secret para as "super keys".
# Elas serão montadas temporariamente em /run/secrets/ e estarão disponíveis para o 'pnpm build'.
RUN --mount=type=secret,id=supabase_service_role_key \
  --mount=type=secret,id=resend_api_key \
  SUPABASE_SERVICE_ROLE_KEY=$(cat /run/secrets/supabase_service_role_key) \
  RESEND_API_KEY=$(cat /run/secrets/resend_api_key) \
  pnpm build

# Remove as dependências de desenvolvimento.
RUN pnpm prune --prod

# Etapa 2: Runner - A Imagem Leve de Produção
# -------------------------------------------
FROM node:22-alpine AS runner

WORKDIR /app

# Copia apenas os artefatos essenciais do builder.
# O arquivo .env não é copiado. Os segredos NÃO estão nesta imagem final.
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

# Definições de ambiente para o contêiner de produção.
# Variáveis como PORT e NODE_ENV são seguras.
# Variáveis NEXT_PUBLIC_ estão embutidas no bundle do Next.js.
ENV NODE_ENV=production
ENV PORT=8000

EXPOSE 8000

RUN addgroup --system --gid 1001 nodejs && \
  adduser --system --uid 1001 nextjs && \
  chown -R nextjs:nodejs /app
USER nextjs

CMD ["node_modules/.bin/next", "start", "-p", "8000", "-H", "0.0.0.0"]