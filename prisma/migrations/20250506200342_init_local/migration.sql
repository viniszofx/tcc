/*
  Warnings:

  - You are about to drop the column `imagem_url` on the `usuarios` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "usuarios" DROP COLUMN "imagem_url",
ADD COLUMN     "avatar_url" TEXT,
ALTER COLUMN "nome" DROP NOT NULL,
ALTER COLUMN "papel" SET DEFAULT 'operador',
ALTER COLUMN "habilitado" SET DEFAULT true;

-- CreateTable
CREATE TABLE "usuariosPermitidos" (
    "usuarios_permitidos_id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "permission" TEXT NOT NULL,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuariosPermitidos_pkey" PRIMARY KEY ("usuarios_permitidos_id")
);

-- AddForeignKey
ALTER TABLE "usuariosPermitidos" ADD CONSTRAINT "usuariosPermitidos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;
