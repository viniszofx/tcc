// Landing Page

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSystemStatus } from "@/hooks/use-system-status";
import {
  ArrowRight,
  Building2,
  CheckCircle,
  QrCode,
  Shield,
  Users2,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function Home() {
  const router = useRouter();
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const {
    status,
    loading: statusLoading,
    error: statusError,
    needsSetup,
  } = useSystemStatus();

  const handleStartNow = async () => {
    console.log("Iniciando o processo...");
    console.log("Status atual:", {
      status,
      needsSetup,
      statusLoading,
      statusError,
    });

    // Se ainda está carregando, aguardar
    if (statusLoading) {
      console.log("Aguardando verificação do sistema...");
      return;
    }

    // Se há erro de rate limiting, mostrar alerta
    if (statusError?.includes("Muitas tentativas")) {
      toast.error("Muitas tentativas. Tente novamente em alguns minutos.");
      return;
    }

    // Se há erro e não conseguiu determinar o status, ir para setup por segurança
    if (statusError && !status) {
      console.warn("Erro na verificação do sistema, redirecionando para setup");
      router.push("/setup");
      return;
    }

    // Usar os dados do hook para decidir o redirecionamento
    console.log("Verificando needsSetup:", needsSetup);
    if (needsSetup) {
      console.log(
        "Sistema precisa ser configurado. Redirecionando para setup..."
      );
      router.push("/setup");
    } else {
      console.log("Sistema configurado. Redirecionando para login...");
      router.push("/login");
    }
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
      toast.error("Por favor, permita o acesso à câmera para usar esta função.");
    }
  };

  const features = [
    {
      title: "Controle Patrimonial Simplificado",
      description:
        "Gerencie seus bens com tecnologia QR Code, reduzindo erros e tempo de inventário",
      icon: <QrCode className="w-10 h-10 text-blue-500" />,
    },
    {
      title: "Gestão Multi-organizacional",
      description:
        "Administre múltiplas unidades e departamentos em uma única plataforma centralizada",
      icon: <Building2 className="w-10 h-10 text-green-500" />,
    },
    {
      title: "Comissões Integradas",
      description:
        "Organize e gerencie comissões de inventário com fluxos de trabalho otimizados",
      icon: <Users2 className="w-10 h-10 text-purple-500" />,
    },
    {
      title: "Segurança e Conformidade",
      description:
        "Mantenha seus dados seguros e em conformidade com as normas patrimoniais",
      icon: <Shield className="w-10 h-10 text-red-500" />,
    },
  ];

  const benefits = [
    "Redução no tempo de inventário",
    "Eliminação de erros em registros manuais",
    "Rastreamento em tempo real dos ativos",
    "Relatórios personalizados e exportáveis",
    "Atualizações regulares do sistema",
  ];

  const data = new Date();
  const year = data.getFullYear();

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      {/* Hero Section - Ajustes de padding e tamanho de fonte */}
      <section className="relative h-auto min-h-[600px] md:h-[700px] flex items-center justify-center bg-gradient-to-r from-[var(--secondary-color)] to-[var(--primary-color)] px-4 sm:px-6">
        <div className="absolute inset-0 bg-grid-white/[0.02]" />
        <div className="relative z-10 text-center text-[var(--primary-color)] w-full max-w-6xl px-4">
          <div className="mb-6 md:mb-8 flex justify-center">
            <Image
              src="/logotipo.svg"
              alt="Logo"
              width={240}
              height={120}
              priority
              className="w-40 md:w-60 drop-shadow-lg"
            />
          </div>
          <Badge className="mb-4 px-3 py-1 text-xs sm:text-sm bg-white/10 backdrop-blur-sm border-white/20">
            Novo: Scanner QR Code integrado ✨
          </Badge>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-100">
            Revolucione sua Gestão Patrimonial
          </h1>
          <p className="text-sm sm:text-base md:text-lg mb-6 md:mb-8 max-w-2xl mx-auto text-gray-200">
            Automatize o controle de patrimônio com tecnologia QR Code e reduza
            o tempo gasto em inventários
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-[var(--secondary-color)] hover:bg-gray-100 transform hover:scale-105 transition-all w-full sm:w-auto"
              onClick={handleStartNow}
              disabled={statusLoading}>
              {statusLoading ? "Verificando sistema..." : "Começar Gratuitamente"}
              {!statusLoading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 w-full sm:w-auto"
              onClick={handleLearnMore}>
              Saiba Mais
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section - Ajustes de padding e grid */}
      <section id="features" className="py-16 md:py-24 px-4 sm:px-6 bg-white scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <Badge className="mb-3 md:mb-4">Funcionalidades</Badge>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 text-[var(--font-color3)]">
              Tudo que você precisa para uma gestão eficiente
            </h2>
            <p className="text-xs sm:text-sm md:text-base max-w-2xl mx-auto text-[var(--font-color3)]">
              Nossa plataforma oferece um conjunto completo de ferramentas para
              modernizar e simplificar sua gestão patrimonial
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="border border-[var(--border-color)] bg-[var(--font-color2)]  hover:shadow-lg transition-shadow h-full">
                <CardHeader>
                  <div className="mb-3 md:mb-4">{feature.icon}</div>
                  <CardTitle className="text-base sm:text-lg md:text-xl text-[var(--font-color3)]">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs sm:text-sm md:text-base text-[var(--font-color3)]">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section - Ajustes de padding */}
      <section className="py-16 md:py-24 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <Badge variant="outline" className="mb-3 md:mb-4 text-[var(--font-color3)]">
              Benefícios
            </Badge>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 text-[var(--font-color3)]">
              Por que escolher nossa solução?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-start gap-3 p-3 md:p-4">
                <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm md:text-base text-gray-700">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Ajustes de padding e botões */}
      <section className="py-16 md:py-24 px-4 sm:px-6 bg-[var(--primary-color)] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4">
            Pronto para modernizar sua gestão patrimonial?
          </h2>
          <p className="mb-6 md:mb-8 text-sm sm:text-base md:text-lg lg:text-xl text-gray-200">
            Comece agora mesmo e transforme a maneira como sua instituição
            gerencia seu patrimônio
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-[var(--secondary-color)] hover:bg-gray-100 w-full sm:w-auto"
              onClick={handleStartNow}
              disabled={statusLoading}
            >
              {statusLoading ? "Verificando..." : "Começar Gratuitamente"}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-[var(--font-color)] hover:bg-white/10 w-full sm:w-auto"
              onClick={handleContact}
            >
              Falar com Especialista
            </Button>
          </div>
        </div>
      </section>

      {/* Footer - Ajustes de alinhamento */}
      <footer className="py-8 md:py-12 px-4 sm:px-6 bg-[var(--secondary-color)] text-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 md:gap-0">
          <div className="text-center md:text-left">
            <div className="flex justify-center md:justify-start mb-4">
              <Image 
                src="/logotipo.svg" 
                alt="Logo" 
                width={120} 
                height={40}
                className="w-28 md:w-36"
              />
            </div>
            <p className="text-xs sm:text-sm text-gray-300 max-w-md">
              Transformando a gestão patrimonial com tecnologia e inovação
            </p>
          </div>
          <div className="text-center md:text-right">
            <p className="text-xs sm:text-sm text-gray-300">
              &copy; {new Date().getFullYear()} Sistema de Gestão Patrimonial
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Desenvolvido por Mockeys Solutions
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}