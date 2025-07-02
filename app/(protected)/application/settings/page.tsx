import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Configurações | TCC",
  description: "Configurações do sistema",
};

export default function SettingsPage() {
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Configurações</h1>

        <div className="grid gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Configurações Gerais</h2>
            <p className="text-gray-600 mb-4">
              Aqui você pode gerenciar as configurações do sistema.
            </p>

            <div className="space-y-4">
              <div className="border-b pb-4">
                <h3 className="font-medium mb-2">Notificações</h3>
                <p className="text-sm text-gray-600">
                  Configure suas preferências de notificação.
                </p>
              </div>

              <div className="border-b pb-4">
                <h3 className="font-medium mb-2">Tema</h3>
                <p className="text-sm text-gray-600">
                  Escolha entre tema claro ou escuro.
                </p>
              </div>

              <div className="border-b pb-4">
                <h3 className="font-medium mb-2">Idioma</h3>
                <p className="text-sm text-gray-600">
                  Selecione o idioma do sistema.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">
              Configurações de Conta
            </h2>
            <p className="text-gray-600 mb-4">
              Gerencie suas informações pessoais e de segurança.
            </p>

            <div className="space-y-4">
              <div className="border-b pb-4">
                <h3 className="font-medium mb-2">Alterar Senha</h3>
                <p className="text-sm text-gray-600">
                  Atualize sua senha de acesso.
                </p>
              </div>

              <div className="border-b pb-4">
                <h3 className="font-medium mb-2">Informações Pessoais</h3>
                <p className="text-sm text-gray-600">
                  Edite seu nome, email e outras informações.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
