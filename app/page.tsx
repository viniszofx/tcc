// Landing Page

"use client";

import LoadingScreen from "@/components/custom/loading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [showLanding, setShowLanding] = useState(false);

  useEffect(() => {
    const validateSystemAndRedirect = async () => {
      try {
        // Verificar se o sistema precisa de configuração inicial
        const systemCheck = await fetch("/api/auth/check-system", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (systemCheck.ok) {
          const { needsOnboarding, isFirstRun } = await systemCheck.json();

          if (needsOnboarding && isFirstRun) {
            // Sistema não configurado - ir para onboarding
            console.log(
              "Sistema não configurado. Redirecionando para setup..."
            );
            router.replace("/setup");
            return;
          }
        }

        // Sistema configurado - mostrar landing page
        setShowLanding(true);
      } catch (error) {
        console.error("Erro na validação inicial:", error);
        // Em caso de erro, assumir que precisa de onboarding
        router.replace("/setup");
      } finally {
        setIsValidating(false);
      }
    };

    validateSystemAndRedirect();
  }, [router]);

  const handleStartNow = () => {
    console.log("Iniciando o processo de registro...");
    router.push("/login");
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

  // Mostrar loading durante validação
  if (isValidating) {
    return <LoadingScreen />;
  }

  // Se não deve mostrar a landing page, não renderizar nada (será redirecionado)
  if (!showLanding) {
    return null;
  }

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
    <div className="min-h-screen w-full">
      {/* Hero Section - Modernizado */}
      <section className="relative h-[700px] flex items-center justify-center bg-gradient-to-r from-[var(--secondary-color)] to-[var(--primary-color)]">
        <div className="absolute inset-0 bg-grid-white/[0.02]" />
        <div className="relative z-10 text-center text-[var(--primary-color)] ">
          <div className="mb-8 flex justify-center">
            <Image
              src="/logotipo.svg"
              alt="Logo"
              width={240}
              height={120}
              priority
              className="drop-shadow-lg"
            />
          </div>
          <Badge className="mb-4 px-4 py-2 text-sm bg-white/10 backdrop-blur-sm border-white/20">
            Novo: Scanner QR Code integrado ✨
          </Badge>{" "}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-100">
            Revolucione sua Gestão Patrimonial
          </h1>
          <p className="text-base sm:text-lg lg:text-xl mb-8 max-w-2xl mx-auto text-gray-200">
            Automatize o controle de patrimônio com tecnologia QR Code e reduza
            o tempo gasto em inventários
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-[var(--secondary-color)] hover:bg-gray-100 transform hover:scale-105 transition-all"
              onClick={handleStartNow}
            >
              Começar Gratuitamente
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20"
              onClick={handleLearnMore}
            >
              Saiba Mais
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section - Remodelado */}
      <section id="features" className="py-24 px-6 bg-white scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4">Funcionalidades</Badge>{" "}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
              Tudo que você precisa para uma gestão eficiente
            </h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
              Nossa plataforma oferece um conjunto completo de ferramentas para
              modernizar e simplificar sua gestão patrimonial
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="border border-gray-200 hover:shadow-lg transition-shadow"
              >
                {" "}
                <CardHeader>
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle className="text-lg sm:text-xl">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm sm:text-base text-gray-600">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section - Novo */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              Benefícios
            </Badge>{" "}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
              Por que escolher nossa solução?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-start gap-4 p-4">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                <p className="text-sm sm:text-base text-gray-700">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Reativado e Melhorado */}
      <section className="py-24 px-6 bg-[var(--primary-color)] text-white">
        <div className="max-w-4xl mx-auto text-center">
          {" "}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
            Pronto para modernizar sua gestão patrimonial?
          </h2>
          <p className="mb-8 text-base sm:text-lg lg:text-xl text-gray-200">
            Comece agora mesmo e transforme a maneira como sua instituição
            gerencia seu patrimônio
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-[var(--secondary-color)] hover:bg-gray-100"
              onClick={handleStartNow}
            >
              Começar Gratuitamente
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-[var(--secondary-color)]  hover:bg-[var(--secondary-color)] hover:text-white"
              onClick={handleContact}
            >
              Falar com Especialista
            </Button>
          </div>
        </div>
      </section>

      {/* Footer - Atualizado */}
      <footer className="py-12 px-6 bg-[var(--secondary-color)] text-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="mb-8 md:mb-0">
            <Image src="/logotipo.svg" alt="Logo" width={140} height={50} />{" "}
            <p className="mt-4 text-sm sm:text-base text-gray-300 max-w-md">
              Transformando a gestão patrimonial com tecnologia e inovação
            </p>
          </div>
          <div className="text-center md:text-right">
            {" "}
            <p className="text-sm sm:text-base text-gray-300">
              &copy; {new Date().getFullYear()} Sistema de Gestão Patrimonial
            </p>
            <p className="text-xs sm:text-sm text-gray-400 mt-2">
              Desenvolvido por Mockeys Solutions
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
