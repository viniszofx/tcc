/*
  Warnings:

  - You are about to drop the `autenticacao_social` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `grupos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `usuarios` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `usuariosPermitidos` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "autenticacao_social" DROP CONSTRAINT "autenticacao_social_usuario_id_fkey";

-- DropForeignKey
ALTER TABLE "bens_copias" DROP CONSTRAINT "bens_copias_grupo_id_fkey";

-- DropForeignKey
ALTER TABLE "bens_copias" DROP CONSTRAINT "bens_copias_ultimo_atualizado_por_fkey";

-- DropForeignKey
ALTER TABLE "comissoes" DROP CONSTRAINT "comissoes_presidente_id_fkey";

-- DropForeignKey
ALTER TABLE "historico_bens" DROP CONSTRAINT "historico_bens_usuario_id_fkey";

-- DropForeignKey
ALTER TABLE "inventarios" DROP CONSTRAINT "inventarios_aberto_por_fkey";

-- DropForeignKey
ALTER TABLE "inventarios" DROP CONSTRAINT "inventarios_fechado_por_fkey";

-- DropForeignKey
ALTER TABLE "inventarios" DROP CONSTRAINT "inventarios_responsavel_id_fkey";

-- DropForeignKey
ALTER TABLE "settings" DROP CONSTRAINT "settings_usuario_id_fkey";

-- DropForeignKey
ALTER TABLE "user_roles" DROP CONSTRAINT "user_roles_usuario_id_fkey";

-- DropForeignKey
ALTER TABLE "usuarios" DROP CONSTRAINT "usuarios_campus_id_fkey";

-- DropForeignKey
ALTER TABLE "usuarios" DROP CONSTRAINT "usuarios_comissao_id_fkey";

-- DropForeignKey
ALTER TABLE "usuarios" DROP CONSTRAINT "usuarios_organizacao_id_fkey";

-- DropForeignKey
ALTER TABLE "usuariosPermitidos" DROP CONSTRAINT "usuariosPermitidos_usuario_id_fkey";

-- DropTable
DROP TABLE "autenticacao_social";

-- DropTable
DROP TABLE "grupos";

-- DropTable
DROP TABLE "usuarios";

-- DropTable
DROP TABLE "usuariosPermitidos";

-- CreateTable
CREATE TABLE "users" (
    "usuario_id" TEXT NOT NULL,
    "nome" TEXT,
    "papel" TEXT NOT NULL DEFAULT 'operador',
    "email" TEXT NOT NULL,
    "senha_hash" TEXT,
    "habilitado" BOOLEAN NOT NULL DEFAULT true,
    "organizacao_id" TEXT NOT NULL,
    "campus_id" TEXT,
    "comissao_id" TEXT,
    "data_inicio" TIMESTAMP(3),
    "data_fim" TIMESTAMP(3),
    "metodo_autenticacao" TEXT NOT NULL,
    "avatar_url" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("usuario_id")
);

-- CreateTable
CREATE TABLE "allowed_users" (
    "usuarios_permitidos_id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "permission" TEXT NOT NULL,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "allowed_users_pkey" PRIMARY KEY ("usuarios_permitidos_id")
);

-- CreateTable
CREATE TABLE "groups" (
    "grupo_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("grupo_id")
);

-- CreateTable
CREATE TABLE "social_auth" (
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

    CONSTRAINT "social_auth_pkey" PRIMARY KEY ("autenticacao_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_organizacao_id_fkey" FOREIGN KEY ("organizacao_id") REFERENCES "organizacoes"("organizacao_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_campus_id_fkey" FOREIGN KEY ("campus_id") REFERENCES "campus"("campus_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_comissao_id_fkey" FOREIGN KEY ("comissao_id") REFERENCES "comissoes"("comissao_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allowed_users" ADD CONSTRAINT "allowed_users_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "users"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comissoes" ADD CONSTRAINT "comissoes_presidente_id_fkey" FOREIGN KEY ("presidente_id") REFERENCES "users"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bens_copias" ADD CONSTRAINT "bens_copias_grupo_id_fkey" FOREIGN KEY ("grupo_id") REFERENCES "groups"("grupo_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bens_copias" ADD CONSTRAINT "bens_copias_ultimo_atualizado_por_fkey" FOREIGN KEY ("ultimo_atualizado_por") REFERENCES "users"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventarios" ADD CONSTRAINT "inventarios_responsavel_id_fkey" FOREIGN KEY ("responsavel_id") REFERENCES "users"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventarios" ADD CONSTRAINT "inventarios_aberto_por_fkey" FOREIGN KEY ("aberto_por") REFERENCES "users"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventarios" ADD CONSTRAINT "inventarios_fechado_por_fkey" FOREIGN KEY ("fechado_por") REFERENCES "users"("usuario_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historico_bens" ADD CONSTRAINT "historico_bens_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "users"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "users"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_auth" ADD CONSTRAINT "social_auth_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "users"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "settings" ADD CONSTRAINT "settings_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "users"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;
