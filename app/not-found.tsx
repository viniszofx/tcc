import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--card-color)] p-6 text-center">
            <div className="max-w-md mx-auto space-y-6">
                <div className="text-8xl" aria-hidden="true">
                    🙈
                </div>

                <h1 className="text-4xl font-bold tracking-tight text-[var(--font-color)] sm:text-5xl">
                    Página não encontrada
                </h1>

                <p className="text-lg text-[var(--font-color)]">
                    Desculpe, não conseguimos encontrar a página que você está procurando.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild variant="default" className="gap-2 bg-[var(--button-color)] px-8 py-6 text-[var(--font-color2)] transition-all hover:bg-[var(--hover-3-color)] hover:text-white">
                        <Link href="/dashboard">
                            <ArrowLeft className="w-4 h-4" />
                            Voltar para a página inicial
                        </Link>
                    </Button>
                </div>

                <p className="text-sm text-[var(--font-color)] mt-8">
                    Código de erro: <span className="font-mono">404</span>
                </p>
            </div>
        </div>
    );
}