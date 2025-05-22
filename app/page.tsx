// Landing Page

"use client";

import { CameraComponent } from "@/components/camera/camera";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [cameraModalOpen, setCameraModalOpen] = useState(false);

  const handleStartNow = () => {
    console.log("Iniciando o processo de registro...");
    router.push("/auth/sign-in");
  };

  const handleLearnMore = () => {
    // Scroll suave até a seção de features
    document.querySelector("#features")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const handleContact = () => {
    // Você pode substituir isso pelo seu email de contato
    window.location.href = "mailto:contato@gestaopatrimonial.com";
  };

  const handleDemoScanner = async () => {
    try {
      // Solicita permissão da câmera antes de abrir
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      stream.getTracks().forEach((track) => track.stop());
      setCameraModalOpen(true);
    } catch (error) {
      console.error("Erro ao acessar câmera:", error);
      alert("Por favor, permita o acesso à câmera para usar esta função.");
    }
  };

  const features = [
    {
      title: "Gestão de Inventário",
      description: "Controle total sobre seus bens patrimoniais com QR Code",
      icon: "📦",
    },
    {
      title: "Multi-organizacional",
      description: "Gerencie múltiplas organizações e câmpus em um só lugar",
      icon: "🏢",
    },
    {
      title: "Comissões",
      description: "Organize comissões de inventário e desfazimento",
      icon: "👥",
    },
    {
      title: "Scanner QR Code",
      description: "Leitura rápida e precisa de patrimônios via câmera",
      icon: "📱",
    },
  ];

  const data = new Date();
  const year = data.getFullYear();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center bg-[var(--secondary-color)]">
        <div className="absolute inset-0" />
        <div className="relative z-10 text-center text-[var(--primary-color)] p-8">
          {/* Logo addition */}
          <div className="mb-8 flex justify-center">
            <Image
              src="/logotipo.svg"
              alt="Logo"
              width={200}
              height={100}
              priority
            />
          </div>

          <h1 className="text-5xl font-bold mb-4">
            Sistema de Gestão Patrimonial
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Simplifique o controle do seu patrimônio com nossa solução completa
            de gestão de inventário
          </p>
          <Button
            size="lg"
            className="mr-4 bg-[var(--button-color)] text-[var(--font-color2)] hover:bg-gray-400"
            onClick={handleStartNow}
          >
            Começar Agora
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white bg-[var([--secondary-color]) text-[var(--font-color2)] hover:bg-white/10"
            onClick={handleLearnMore}
          >
            Saiba Mais
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-20 px-6 bg-[var(--bg-simple)] scroll-mt-20"
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Funcionalidades Principais
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <Card key={feature.title} className="text-center">
                <CardHeader>
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          {/* <h2 className="text-3xl font-bold mb-12">Demonstração do Scanner</h2> */}
          <div className="flex flex-col items-center justify-center">
            <p className="text-lg text-muted-foreground mb-4">Em breve!</p>
            <p className="max-w-2xl text-muted-foreground mb-8">
              Experimente nossa função de scanner QR Code diretamente pelo
              navegador. Com ela, você poderá fazer a leitura rápida e eficiente
              dos códigos patrimoniais, facilitando o processo de inventário.
            </p>
            {cameraModalOpen ? (
              <CameraComponent onClose={() => setCameraModalOpen(false)} />
            ) : (
              <Button
                size="lg"
                className="bg-[var(--button-color)] text-[var(--font-color2)] hover:bg-gray-400"
                onClick={handleDemoScanner}
                disabled
              >
                Testar Scanner QR Code
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section
      <section className="py-20 px-6 bg-[var(--primary-color)] text-[var(--font-color2)]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Pronto para modernizar sua gestão patrimonial?
          </h2>
          <p className="mb-8 text-lg">
            Entre em contato conosco e descubra como podemos ajudar sua
            instituição
          </p>
          <Button
            size="lg"
            className="bg-[var(--button-color)] text-[var(--font-color2)] hover:bg-gray-400"
            onClick={handleContact}
          >
            Entrar em Contato
          </Button>
        </div>
      </section> */}

      {/* Footer */}
      <footer className="py-8 px-6 bg-[var(--secondary-color)] text-[var(--font-color2)]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Image src="/logotipo.svg" alt="Logo" width={120} height={40} />
          </div>
          <div className="text-center md:text-right">
            <p>
              &copy; {year} Sistema de Gestão Patrimonial - KDE | Todos os
              direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
