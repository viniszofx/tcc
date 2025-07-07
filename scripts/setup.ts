import { setupAvatarsBucket } from "@/lib/supabase-avatars";
import { setupSpreadsheetsBucket } from "@/lib/supabase-spreadsheets";
import { config } from "dotenv";
// Importação condicional para evitar problemas no build
// import { cleanDatabase } from "./clean-database";

// Carregar variáveis de ambiente (exceto em produção)
if (process.env.NODE_ENV !== "production") {
  config({ path: ".env" });
  console.log("🔧 Variáveis de ambiente carregadas do arquivo .env");
}

// Função para setup de avatars e spreadsheets (executado durante o build)
async function setupAvatars() {
  try {
    console.log("📁 === CONFIGURAÇÃO DOS BUCKETS DE STORAGE ===");

    console.log("🔧 Executando configuração dos buckets...");

    // Configurar bucket de avatares
    console.log("\n📸 Configurando bucket de avatares...");
    const avatarsSuccess = await setupAvatarsBucket();

    // Configurar bucket de spreadsheets
    console.log("\n📊 Configurando bucket de planilhas...");
    const spreadsheetsSuccess = await setupSpreadsheetsBucket();

    if (avatarsSuccess && spreadsheetsSuccess) {
      console.log("\n✅ Todos os buckets configurados com sucesso!");
      return true;
    } else {
      console.warn("\n⚠️ Falha ao configurar alguns buckets");
      console.log("💡 Os buckets podem ser configurados posteriormente com:");
      console.log("   npm run setup avatars     # Para configurar ambos");
      console.log("   npm run setup spreadsheets  # Apenas spreadsheets");
      return false;
    }
  } catch (error) {
    console.error("❌ Erro ao configurar buckets:", error);

    // Em caso de erro, não falhar o build (mas logar o erro)
    console.log(
      "⚠️ Continuando o build mesmo com erro na configuração dos buckets"
    );
    console.log(
      "💡 Configure os buckets manualmente após o deploy se necessário"
    );
    return true;
  }
}

// Função para setup de spreadsheets
async function setupSpreadsheets() {
  try {
    console.log("📊 === CONFIGURAÇÃO DO BUCKET DE PLANILHAS ===");

    console.log("🔧 Executando configuração do bucket...");

    const success = await setupSpreadsheetsBucket();

    if (success) {
      console.log("✅ Bucket de spreadsheets configurado com sucesso!");
      return true;
    } else {
      console.warn("⚠️ Falha ao configurar bucket de spreadsheets");
      console.log("💡 O bucket pode ser configurado posteriormente com:");
      console.log("   npm run setup spreadsheets");
      return false;
    }
  } catch (error) {
    console.error("❌ Erro ao configurar bucket de spreadsheets:", error);

    // Em caso de erro, não falhar o build (mas logar o erro)
    console.log("⚠️ Continuando mesmo com erro na configuração do bucket");
    console.log(
      "💡 Configure o bucket manualmente após o deploy se necessário"
    );
    return true;
  }
}

// Função para setup completo do sistema
async function setupSystem() {
  try {
    console.log("🚀 Iniciando setup completo do sistema...");

    // Configurar bucket de avatares
    console.log("\n📁 === CONFIGURAÇÃO DE BUCKETS ===");
    await setupAvatars();

    // Configurar bucket de spreadsheets
    await setupSpreadsheets();

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
    const { cleanDatabase } = await import("@/scripts/clean-database");
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
      const { cleanDatabase } = await import("@/scripts/clean-database");
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

    case "spreadsheets":
      await setupSpreadsheets();
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
      console.log(
        "  setup avatars            Configurar buckets (avatars + spreadsheets)"
      );
      console.log(
        "  setup spreadsheets        Configurar apenas bucket de spreadsheets"
      );
      console.log(
        "  setup setup              Setup completo (configurar buckets)"
      );
      console.log("  setup reset [--force]    Reset completo (clean + setup)");
      console.log("  setup help               Mostrar esta ajuda");
      console.log("");
      console.log("Exemplos:");
      console.log("  npm run setup avatars    # Configurar ambos os buckets");
      console.log(
        "  npm run setup spreadsheets  # Configurar bucket de spreadsheets"
      );
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

export { resetSystem, setupAvatars, setupSpreadsheets, setupSystem };
