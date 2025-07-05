import { prisma } from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function authenticateUser() {
  const supabase = await createServerSupabaseClient();

  // Obter o usuário atual autenticado via Supabase
  const {
    data: { user: realUser },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !realUser) {
    throw new Error("Não autorizado");
  }

  // Verificar se o usuário existe no banco de dados UserProfile e buscar informações completas
  const userProfile = await prisma.userProfile.findUnique({
    where: { id: realUser.id },
    include: {
      organizationMembers: {
        include: {
          organization: true,
        },
      },
    },
  });

  // Se não existir no UserProfile, não permitir a operação
  if (!userProfile) {
    console.error(
      "❌ Usuário autenticado não encontrado no UserProfile:",
      realUser.id
    );
    throw new Error(
      "Usuário autenticado não encontrado no sistema. Por favor, verifique se seu usuário foi configurado corretamente."
    );
  }

  return userProfile;
}