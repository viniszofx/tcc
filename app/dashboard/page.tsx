// Essa página somente sera acessada pelo Admin

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProcessingPage() {
  const isAdmin = true; // Você pode substituir isso pela lógica real de verificação

  return (
    <Card className="w-full max-w-3xl bg-[var(--bg-simple)] shadow-lg transition-all duration-300 lg:max-w-5xl xl:max-w-6xl">
      <CardHeader className="pb-2 text-center">
        <CardTitle className="text-xl font-bold text-[var(--font-color)] md:text-2xl lg:text-3xl">
          Dashboard Administrador
        </CardTitle>
        <CardDescription className="text-sm text-[var(--font-color)] md:text-base">
          O que deseja fazer hoje?
        </CardDescription>  
      </CardHeader>

      <CardContent className="flex flex-col gap-8">
        
      </CardContent>
    </Card>
  );
}
