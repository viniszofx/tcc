import { prisma } from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { withDatabaseTimeout, OPTIMIZED_QUERY_CONFIG } from "@/lib/database-utils";

export async function authenticateUser() {
  const supabase = await createServerSupabaseClient();

  // Implementar retry para operações de autenticação
  let authError: any = null;
  let realUser: any = null;
  let retryCount = 0;
  const maxRetries = 3;

  while (retryCount < maxRetries) {
    try {
      // Obter o usuário atual autenticado via Supabase
      const result = await supabase.auth.getUser();
      authError = result.error;
      realUser = result.data.user;
      
      if (!authError && realUser) {
        break; // Sucesso, sair do loop
      }
      
      if (authError && authError.message?.includes('fetch failed')) {
        retryCount++;
        if (retryCount < maxRetries) {
          console.warn(`Tentativa ${retryCount} falhou, tentando novamente...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Backoff exponencial
          continue;
        }
      } else {
        break; // Erro não relacionado a rede, sair do loop
      }
    } catch (error: any) {
      authError = error;
      if (error.message?.includes('fetch failed') || error.name === 'AbortError') {
        retryCount++;
        if (retryCount < maxRetries) {
          console.warn(`Tentativa ${retryCount} falhou com erro de rede, tentando novamente...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          continue;
        }
      }
      break;
    }
  }

  if (authError || !realUser) {
    console.error('Erro de autenticação após', retryCount, 'tentativas:', authError);
    throw new Error("Não autorizado");
  }

  // Verificar se o usuário existe no banco de dados UserProfile e buscar informações completas
  const userProfile = await withDatabaseTimeout(
    () => prisma.userProfile.findUnique({
      where: { id: realUser.id },
      include: {
        organizationMembers: {
          include: {
            organization: true,
          },
        },
      },
    }),
    OPTIMIZED_QUERY_CONFIG.COMPLEX_QUERY_TIMEOUT
  );

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