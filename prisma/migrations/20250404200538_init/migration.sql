-- CreateEnum
CREATE TYPE "EstadoConservacao" AS ENUM ('NOVO', 'BOM', 'REGULAR', 'RUIM', 'INSERVIVEL');

-- CreateEnum
CREATE TYPE "StatusBem" AS ENUM ('ATIVO', 'EM_USO', 'BAIXA_SOLICITADA', 'BAIXADO');

-- CreateTable
CREATE TABLE "usuarios" (
    "usuario_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "papel" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha_hash" TEXT,
    "habilitado" BOOLEAN NOT NULL,
    "organizacao_id" TEXT NOT NULL,
    "campus_id" TEXT,
    "comissao_id" TEXT,
    "data_inicio" TIMESTAMP(3),
    "data_fim" TIMESTAMP(3),
    "metodo_autenticacao" TEXT NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("usuario_id")
);

-- CreateTable
CREATE TABLE "comissoes" (
    "comissao_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "data_inicio" TIMESTAMP(3) NOT NULL,
    "data_fim" TIMESTAMP(3) NOT NULL,
    "presidente_id" TEXT NOT NULL,
    "organizacao_id" TEXT NOT NULL,

    CONSTRAINT "comissoes_pkey" PRIMARY KEY ("comissao_id")
);

-- CreateTable
CREATE TABLE "organizacoes" (
    "organizacao_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "organizacoes_pkey" PRIMARY KEY ("organizacao_id")
);

-- CreateTable
CREATE TABLE "campus" (
    "campus_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "campus_codigo" TEXT NOT NULL,
    "organizacao_id" TEXT NOT NULL,

    CONSTRAINT "campus_pkey" PRIMARY KEY ("campus_id")
);

-- CreateTable
CREATE TABLE "responsaveis" (
    "responsavel_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "setor" TEXT NOT NULL,
    "campus_id" TEXT NOT NULL,

    CONSTRAINT "responsaveis_pkey" PRIMARY KEY ("responsavel_id")
);

-- CreateTable
CREATE TABLE "bens_originais" (
    "bem_id" TEXT NOT NULL,
    "campus_id" TEXT NOT NULL,
    "NUMERO" TEXT NOT NULL,
    "STATUS" TEXT NOT NULL,
    "ED" TEXT NOT NULL,
    "DESCRICAO" TEXT NOT NULL,
    "ROTULOS" TEXT NOT NULL,
    "RESPONSABILIDADE_ATUAL" TEXT NOT NULL,
    "SETOR_DO_RESPONSAVEL" TEXT NOT NULL,
    "CAMPUS_DA_LOTACAO_DO_BEM" TEXT NOT NULL,
    "SALA" TEXT NOT NULL,
    "ESTADO_DE_CONSERVACAO" TEXT NOT NULL,
    "DESCRICAO_PRINCIPAL" TEXT NOT NULL,
    "MARCA_MODELO" TEXT NOT NULL,

    CONSTRAINT "bens_originais_pkey" PRIMARY KEY ("bem_id")
);

-- CreateTable
CREATE TABLE "bens_copias" (
    "bem_id" TEXT NOT NULL,
    "inventario_id" TEXT NOT NULL,
    "grupo_id" TEXT NOT NULL,
    "campus_id" TEXT NOT NULL,
    "NUMERO" TEXT NOT NULL,
    "STATUS" "StatusBem" NOT NULL,
    "ED" TEXT NOT NULL,
    "DESCRICAO" TEXT NOT NULL,
    "ROTULOS" TEXT NOT NULL,
    "RESPONSABILIDADE_ATUAL" TEXT NOT NULL,
    "SETOR_DO_RESPONSAVEL" TEXT NOT NULL,
    "CAMPUS_DA_LOTACAO_DO_BEM" TEXT NOT NULL,
    "SALA" TEXT NOT NULL,
    "ESTADO_DE_CONSERVACAO" "EstadoConservacao" NOT NULL,
    "DESCRICAO_PRINCIPAL" TEXT NOT NULL,
    "MARCA_MODELO" TEXT NOT NULL,
    "ultimo_atualizado_por" TEXT NOT NULL,
    "data_ultima_atualizacao" TIMESTAMP(3) NOT NULL,
    "observacoes" TEXT,

    CONSTRAINT "bens_copias_pkey" PRIMARY KEY ("bem_id")
);

-- CreateTable
CREATE TABLE "inventarios" (
    "inventario_id" TEXT NOT NULL,
    "comissao_id" TEXT NOT NULL,
    "responsavel_id" TEXT NOT NULL,
    "data_inicio" TIMESTAMP(3) NOT NULL,
    "data_fim" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "aberto_por" TEXT NOT NULL,
    "fechado_por" TEXT,
    "data_abertura" TIMESTAMP(3) NOT NULL,
    "data_fechamento" TIMESTAMP(3),

    CONSTRAINT "inventarios_pkey" PRIMARY KEY ("inventario_id")
);

-- CreateTable
CREATE TABLE "historico_bens" (
    "evento_id" TEXT NOT NULL,
    "bem_id" TEXT NOT NULL,
    "inventario_id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "acao" TEXT NOT NULL,
    "observacao" TEXT,
    "data_evento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historico_bens_pkey" PRIMARY KEY ("evento_id")
);

-- CreateTable
CREATE TABLE "grupos" (
    "grupo_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,

    CONSTRAINT "grupos_pkey" PRIMARY KEY ("grupo_id")
);

-- CreateTable
CREATE TABLE "roles" (
    "role_id" TEXT NOT NULL,
    "role_name" TEXT NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "permission_id" TEXT NOT NULL,
    "permission_name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("permission_id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "role_id" TEXT NOT NULL,
    "permission_id" TEXT NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("role_id","permission_id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "usuario_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("usuario_id","role_id")
);

-- CreateTable
CREATE TABLE "autenticacao_social" (
    "autenticacao_id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "provedor" TEXT NOT NULL,
    "provedor_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "avatar_url" TEXT,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "data_criacao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "autenticacao_social_pkey" PRIMARY KEY ("autenticacao_id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "campus_campus_codigo_key" ON "campus"("campus_codigo");

-- CreateIndex
CREATE UNIQUE INDEX "responsaveis_campus_id_key" ON "responsaveis"("campus_id");

-- CreateIndex
CREATE UNIQUE INDEX "roles_role_name_key" ON "roles"("role_name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_permission_name_key" ON "permissions"("permission_name");

-- CreateIndex
CREATE UNIQUE INDEX "settings_key_key" ON "settings"("key");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_organizacao_id_fkey" FOREIGN KEY ("organizacao_id") REFERENCES "organizacoes"("organizacao_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_campus_id_fkey" FOREIGN KEY ("campus_id") REFERENCES "campus"("campus_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_comissao_id_fkey" FOREIGN KEY ("comissao_id") REFERENCES "comissoes"("comissao_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comissoes" ADD CONSTRAINT "comissoes_organizacao_id_fkey" FOREIGN KEY ("organizacao_id") REFERENCES "organizacoes"("organizacao_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comissoes" ADD CONSTRAINT "comissoes_presidente_id_fkey" FOREIGN KEY ("presidente_id") REFERENCES "usuarios"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campus" ADD CONSTRAINT "campus_organizacao_id_fkey" FOREIGN KEY ("organizacao_id") REFERENCES "organizacoes"("organizacao_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "responsaveis" ADD CONSTRAINT "responsaveis_campus_id_fkey" FOREIGN KEY ("campus_id") REFERENCES "campus"("campus_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bens_originais" ADD CONSTRAINT "bens_originais_campus_id_fkey" FOREIGN KEY ("campus_id") REFERENCES "campus"("campus_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bens_copias" ADD CONSTRAINT "bens_copias_campus_id_fkey" FOREIGN KEY ("campus_id") REFERENCES "campus"("campus_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bens_copias" ADD CONSTRAINT "bens_copias_inventario_id_fkey" FOREIGN KEY ("inventario_id") REFERENCES "inventarios"("inventario_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bens_copias" ADD CONSTRAINT "bens_copias_grupo_id_fkey" FOREIGN KEY ("grupo_id") REFERENCES "grupos"("grupo_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bens_copias" ADD CONSTRAINT "bens_copias_bem_id_fkey" FOREIGN KEY ("bem_id") REFERENCES "bens_originais"("bem_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bens_copias" ADD CONSTRAINT "bens_copias_ultimo_atualizado_por_fkey" FOREIGN KEY ("ultimo_atualizado_por") REFERENCES "usuarios"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventarios" ADD CONSTRAINT "inventarios_comissao_id_fkey" FOREIGN KEY ("comissao_id") REFERENCES "comissoes"("comissao_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventarios" ADD CONSTRAINT "inventarios_responsavel_id_fkey" FOREIGN KEY ("responsavel_id") REFERENCES "usuarios"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventarios" ADD CONSTRAINT "inventarios_aberto_por_fkey" FOREIGN KEY ("aberto_por") REFERENCES "usuarios"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventarios" ADD CONSTRAINT "inventarios_fechado_por_fkey" FOREIGN KEY ("fechado_por") REFERENCES "usuarios"("usuario_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historico_bens" ADD CONSTRAINT "historico_bens_bem_id_fkey" FOREIGN KEY ("bem_id") REFERENCES "bens_copias"("bem_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historico_bens" ADD CONSTRAINT "historico_bens_inventario_id_fkey" FOREIGN KEY ("inventario_id") REFERENCES "inventarios"("inventario_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historico_bens" ADD CONSTRAINT "historico_bens_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("role_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("permission_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("role_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "autenticacao_social" ADD CONSTRAINT "autenticacao_social_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;
