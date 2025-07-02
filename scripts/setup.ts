import { setupAvatarsBucket } from "@/lib/supabase-avatars";
import { config } from "dotenv";
import { cleanDatabase } from "./clean-database";

// Carregar variáveis de ambiente
config({ path: ".env" });

// Função para setup de avatars
async function setupAvatars() {
  try {
    console.log("📁 Configurando bucket de avatares...");
    const success = await setupAvatarsBucket();
    if (success) {
      console.log("✅ Bucket de avatares configurado com sucesso!");
    } else {
      console.warn(
        "⚠️ Falha ao configurar bucket de avatares (pode já existir)"
      );
    }
    return success;
  } catch (error) {
    console.error("❌ Erro ao configurar bucket de avatares:", error);
    throw error;
  }
}

// Função para setup completo do sistema
async function setupSystem() {
  try {
    console.log("🚀 Iniciando setup completo do sistema...");

    // Configurar bucket de avatares
    console.log("\n📁 === CONFIGURAÇÃO DE BUCKETS ===");
    await setupAvatars();

    console.log("\n🎉 SETUP COMPLETO CONCLUÍDO!");
    console.log("✅ Sistema pronto para uso!");
  } catch (error) {
    console.error("❌ Erro durante setup completo:", error);
    throw error;
  }
}

// Função para reset completo (clean + setup)
async function resetSystem() {
  try {
    console.log("🔄 Iniciando reset completo do sistema...");

    // 1. Limpar sistema
    console.log("\n🧹 === LIMPEZA COMPLETA ===");
    await cleanDatabase();

    // 2. Setup completo
    console.log("\n🚀 === SETUP COMPLETO ===");
    await setupSystem();

    console.log("\n🎉 RESET COMPLETO CONCLUÍDO!");
    console.log("✅ Sistema resetado e pronto para uso!");
  } catch (error) {
    console.error("❌ Erro durante reset completo:", error);
    throw error;
  }
}

// Função principal para processar argumentos
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const flags = args.slice(1);

  console.log("Debug - args:", args);
  console.log("Debug - command:", command);
  console.log("Debug - flags:", flags);

  // Verificar ambiente de produção
  if (
    process.env.NODE_ENV === "production" &&
    ["clean", "reset"].includes(command)
  ) {
    console.error("❌ Operações de limpeza não permitidas em produção!");
    process.exit(1);
  }

  // Verificar flag --force para operações perigosas
  const hasForceFlag = flags.includes("--force") || flags.includes("-f");

  switch (command) {
    case "clean":
      if (!hasForceFlag) {
        console.log("⚠️ ATENÇÃO: Esta operação irá DELETAR TODOS OS DADOS!");
        console.log("💡 Para executar, use: npm run setup clean --force");
        process.exit(0);
      }
      await cleanDatabase();
      break;

    case "seed":
      console.log("❌ Comando 'seed' não está mais disponível");
      console.log("💡 Use scripts específicos para criar dados de teste");
      process.exit(1);
      break;

    case "avatars":
      await setupAvatars();
      break;

    case "setup":
      await setupSystem();
      break;

    case "reset":
      if (!hasForceFlag) {
        console.log("⚠️ ATENÇÃO: Esta operação irá RESETAR TODO O SISTEMA!");
        console.log("💡 Para executar, use: npm run setup reset --force");
        process.exit(0);
      }
      await resetSystem();
      break;

    case "help":
    case "--help":
    case "-h":
    default:
      console.log("🔧 SETUP DO SISTEMA TCC");
      console.log("");
      console.log("Comandos disponíveis:");
      console.log("");
      console.log(
        "  setup clean [--force]     Limpar todo o sistema (DB + Supabase)"
      );
      console.log("  setup avatars            Configurar bucket de avatares");
      console.log(
        "  setup setup              Setup completo (configurar buckets)"
      );
      console.log("  setup reset [--force]    Reset completo (clean + setup)");
      console.log("  setup help               Mostrar esta ajuda");
      console.log("");
      console.log("Exemplos:");
      console.log("  npm run setup avatars    # Configurar bucket de avatares");
      console.log("  npm run setup setup      # Setup completo");
      console.log("  npm run setup clean --force  # Limpar sistema");
      console.log("  npm run setup reset --force  # Reset completo");
      console.log("");
      console.log("⚠️ Operações com --force são IRREVERSÍVEIS!");
      break;
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  main().catch((error) => {
    console.error("💥 Falha na execução:", error);
    process.exit(1);
  });
}

export { resetSystem, setupAvatars, setupSystem };
