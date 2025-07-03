import { prisma } from "@/lib/prisma";
import { createSupabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/user/{id}/reset-password:
 *   post:
 *     tags:
 *       - Users
 *     summary: Resetar senha do usuário
 *     description: Gera uma nova senha temporária para o usuário
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Senha resetada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tempPassword:
 *                   type: string
 *                   description: Nova senha temporária
 *                 message:
 *                   type: string
 *                   description: Mensagem de sucesso
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;

    // Verificar se o usuário existe
    const user = await prisma.userProfile.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Gerar nova senha temporária
    const tempPassword = `kde${Math.random().toString(36).slice(-6)}!`;

    // Atualizar senha no Supabase Auth
    const supabaseAdmin = createSupabaseAdmin();
    const { error: updateError } =
      await supabaseAdmin.auth.admin.updateUserById(id, {
        password: tempPassword,
      });

    if (updateError) {
      console.error("Erro ao atualizar senha no Supabase:", updateError);
      return NextResponse.json(
        { error: `Erro ao atualizar senha: ${updateError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      tempPassword,
      message: "Senha resetada com sucesso",
    });
  } catch (error) {
    console.error("Erro ao resetar senha:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
