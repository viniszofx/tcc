# Etapa 1: Builder - Onde a Aplicação é Construída
# -----------------------------------------------
# Esta primeira etapa é responsável por instalar as dependências de desenvolvimento
# e de produção, e então, compilar sua aplicação Next.js.
# O resultado desta etapa (o build final e as dependências otimizadas)
# será transferido para a próxima etapa.

# Define a imagem base para esta etapa.
# 'node:22-alpine' é uma imagem oficial do Node.js baseada na distribuição Alpine Linux,
# que é conhecida por ser extremamente leve e segura, ideal para ambientes de contêineres.
FROM node:22-alpine AS builder

# Define o diretório de trabalho dentro do contêiner.
# Todos os comandos subsequentes (COPY, RUN) serão executados a partir deste diretório.
WORKDIR /app

# Ativa o pnpm via corepack.
# 'corepack' é um recurso do Node.js que gerencia instaladores de pacotes (npm, yarn, pnpm).
# Habilitá-lo e preparar 'pnpm@latest' garante que o pnpm esteja disponível e seja a versão mais recente.
# Isso é mais robusto do que instalar o pnpm globalmente, pois usa o mecanismo nativo do Node.js.
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copia apenas os arquivos de dependência ('package.json' e 'pnpm-lock.yaml').
# Fazer isso separadamente antes da instalação de dependências permite que o Docker utilize
# o cache de camadas. Se estes arquivos não mudarem, as dependências não serão reinstaladas,
# tornando os builds subsequentes muito mais rápidos.
COPY package.json pnpm-lock.yaml ./

# Instala todas as dependências do projeto (tanto de produção quanto de desenvolvimento).
# '--frozen-lockfile' garante que as dependências sejam instaladas exatamente como especificado
# no 'pnpm-lock.yaml', prevenindo problemas de incompatibilidade em diferentes ambientes.
RUN pnpm install --frozen-lockfile

# Copia o restante do código-fonte do seu projeto para o diretório de trabalho.
# O '.dockerignore' (se existir) é essencial aqui para excluir arquivos desnecessários
# (como '.git', 'node_modules' local, etc.) que não devem ser copiados para a imagem.
COPY . .

# Copia o arquivo de variáveis de ambiente '.env.production' e renomeia para '.env'.
# Isso garante que as variáveis de ambiente corretas para o ambiente de produção
# estejam disponíveis durante o processo de build do Next.js.
COPY .env.production .env

# Executa o comando de build da aplicação Next.js.
# Este comando compila o código-fonte, gera os arquivos estáticos e as páginas do Next.js
# que serão servidos em produção.
RUN pnpm build

# Remove as dependências de desenvolvimento (devDependencies) do diretório 'node_modules'.
# 'pnpm prune --prod' limpa o 'node_modules', deixando apenas o que é estritamente
# necessário para a aplicação rodar em produção. Isso reduz significativamente
# o tamanho final da imagem.
RUN pnpm prune --prod


# Etapa 2: Runner - A Imagem Leve de Produção
# -------------------------------------------
# Esta etapa é onde a imagem final e otimizada é criada.
# Ela é projetada para ser o menor possível, contendo apenas o que é necessário
# para executar sua aplicação Next.js em produção.

# Define a imagem base para a etapa de execução.
# Novamente, 'node:22-alpine' é escolhida por sua leveza.
FROM node:22-alpine AS runner

# Define o diretório de trabalho dentro do contêiner para o runner.
WORKDIR /app

# Copia apenas os artefatos essenciais da etapa 'builder' para a etapa 'runner'.
# Isso evita que arquivos desnecessários (ferramentas de build, código-fonte bruto, etc.)
# sejam incluídos na imagem final, mantendo-a o mais leve possível.
# - '/app/.next': Contém o build compilado da aplicação Next.js.
# - '/app/public': Contém os ativos estáticos (imagens, fontes, etc.).
# - '/app/package.json': Necessário para o Next.js identificar o projeto.
# - '/app/node_modules': As dependências de produção já podadas na etapa 'builder'.
# - '/app/.env': O arquivo de variáveis de ambiente final para o runtime.
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.env ./.env

# Definições de ambiente para o contêiner de produção.
# 'NODE_ENV=production' otimiza o Node.js e muitas bibliotecas para o ambiente de produção.
# 'PORT=8000' define a porta que a aplicação Next.js irá escutar dentro do contêiner.
ENV NODE_ENV=production
ENV PORT=8000

# Expõe a porta 8000 do contêiner.
# Isso informa ao Docker que a aplicação dentro do contêiner usará esta porta.
# Não publica a porta no host; para isso, você precisa usar '-p' no comando 'docker run'.
EXPOSE 8000

# Define o comando que será executado quando o contêiner for iniciado.
# 'node_modules/.bin/next' é o executável do Next.js.
# 'start' inicia a aplicação em modo de produção.
# '-p 8000' especifica a porta de escuta.
# '-H 0.0.0.0' faz com que o servidor Next.js escute em todas as interfaces de rede,
# o que é essencial para que o contêiner possa ser acessado externamente.
CMD ["node_modules/.bin/next", "start", "-p", "8000", "-H", "0.0.0.0"]