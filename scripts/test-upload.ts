/**
 * Script de teste para verificar se o endpoint de upload está funcionando
 */
async function testUploadEndpoint() {
  try {
    console.log("🧪 Testando endpoint de upload...");

    // Criar um arquivo CSV de teste
    const csvContent =
      "nome,email,funcao\nJoão Silva,joao@example.com,membro\nMaria Santos,maria@example.com,secretario";
    const blob = new Blob([csvContent], { type: "text/csv" });
    const file = new File([blob], "test-members.csv", { type: "text/csv" });

    // Criar FormData
    const formData = new FormData();
    formData.append("file", file);
    formData.append("commissionId", "1"); // ID de teste

    // Fazer a requisição
    const response = await fetch("/api/commission/upload", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (response.ok) {
      console.log("✅ Upload test successful:", result);
    } else {
      console.error("❌ Upload test failed:", result);
    }
  } catch (error) {
    console.error("❌ Test error:", error);
  }
}

// Para executar no navegador (console)
if (typeof window !== "undefined") {
  // Disponibilizar a função globalmente
  (window as any).testUploadEndpoint = testUploadEndpoint;
  console.log(
    "💡 Execute testUploadEndpoint() no console do navegador para testar"
  );
}

export { testUploadEndpoint };
