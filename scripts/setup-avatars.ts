import { setupAvatarsBucket } from "@/lib/supabase-avatars";
import { config } from "dotenv";

// Carregar variáveis de ambiente do arquivo .env
config({ path: ".env" });

// Script de inicialização para configurar o bucket de avatares
async function initializeAvatarsBucket() {
  console.log("🚀 Iniciando configuração do bucket de avatares...");

  try {
    const success = await setupAvatarsBucket();

    if (success) {
      console.log("✅ Bucket de avatares configurado com sucesso!");
    } else {
      console.error("❌ Falha ao configurar bucket de avatares");
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Erro durante configuração do bucket:", error);
    process.exit(1);
  }
}

// Executar apenas se este arquivo foi chamado diretamente
if (require.main === module) {
  initializeAvatarsBucket();
}

export { initializeAvatarsBucket };
