/*
  Warnings:

  - Added the required column `usuario_id` to the `settings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "settings" ADD COLUMN     "usuario_id" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "settings_usuario_id_idx" ON "settings"("usuario_id");

-- AddForeignKey
ALTER TABLE "settings" ADD CONSTRAINT "settings_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;
