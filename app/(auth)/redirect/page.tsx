import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";

export const metadata = {
  title: "Redirecionando - KDÊ",
}

export default function page() {
  return (
    <main>
      <Card className="mx-auto max-w-3xl w-full mt-4 overflow-auto md:p-8 border-[var(--border-color)] bg-[var(--bg-simple)]">
        <CardHeader className="w-full flex flex-col items-start md:items-center text-left md:text-center px-4 md:px-6">
          <Image
            className="w-88 h-auto hidden md:block mb-6"
            src="/logotipo.svg"
            alt="logo"
            width={352}
            height={100}
          />
          <CardTitle className="text-3xl md:text-4xl font-bold text-[var(--font-color)]">
            Redirecionando...
          </CardTitle>
          <CardDescription className="mt-2 text-sm md:text-base text-[var(--font-color)]">
            Estamos validando suas credenciais e preparando seu acesso.
          </CardDescription>
          <CardDescription className="mt-2 text-sm md:text-base text-[var(--font-color)]">
            Você será redirecionado em breve. Se não for redirecionado,{" "}
            <a href="/" className="text-blue-500 hover:underline">
              clique aqui
            </a>
            .
          </CardDescription>
        </CardHeader>
      </Card>
    </main>
  );
}
