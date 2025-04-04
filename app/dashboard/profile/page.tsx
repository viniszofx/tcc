"use client";

import ProfileAvatar from "@/app/custom/profile-avatar";
import ProfileForm from "@/app/custom/profile-form";
import RoleProfile from "@/app/custom/profile-role";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

export default function ProfilePage() {
  const [perfil, setPerfil] = useState({
    nome: "João Silva",
    email: "joao@email.com",
    campus: "IFMS Corumbá",
    descricao: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    cargo: "admin" as "admin" | "operador" | "presidente",
    foto: "/logo.svg",
  });

  return (
    <div className="flex-1 w-full p-3 xs:p-4 sm:p-5 md:p-6 lg:p-8 flex items-center justify-center">
      <Card className="bg-[var(--bg-simple)] w-full max-w-[98%] xs:max-w-[95%] sm:max-w-[90%] md:max-w-[85%] lg:max-w-[calc(100%-var(--sidebar-width)-2rem)] mx-auto shadow-md rounded-lg flex flex-col h-full md:h-auto flex-grow">

        <CardContent className="flex-grow p-0">
          <div className="flex flex-col md:flex-row h-full p-6 sm:p-8 gap-8">
            <div className="w-full md:w-1/3 flex flex-col space-y-6">
              <div className="flex flex-col items-center space-y-4 bg-[var(--bg-simple)] rounded-lg p-4 border border-[var(--border-color)] shadow-sm">
                <RoleProfile cargo={perfil.cargo} />
                <ProfileAvatar foto={perfil.foto} />
                <h3 className="font-medium text-[var(--font-color)]">{perfil.nome}</h3>
                <p className="text-sm text-[var(--font-color)]/70">{perfil.email}</p>
              </div>

              <div className="bg-[var(--bg-simple)] rounded-lg p-4 border border-[var(--border-color)] shadow-sm">
                <h3 className="text-sm font-medium text-[var(--font-color)] mb-3">Sobre mim</h3>
                <div className="p-3 bg-[var(--bg-simple)] rounded-md border border-[var(--border-input)] min-h-24 text-sm text-[var(--font-color)]">
                  {perfil.descricao || "Nenhuma descrição informada"}
                </div>
              </div>

              <div className="bg-[var(--bg-simple)] rounded-lg p-4 border border-[var(--border-color)] shadow-sm">
                <h3 className="text-sm font-medium text-[var(--font-color)] mb-3">Campus</h3>
                <p className="text-sm text-[var(--font-color)]">{perfil.campus}</p>
              </div>
            </div>

            <Separator orientation="vertical" className="hidden md:block" />

            <div className="w-full md:w-2/3">
              <div className="bg-[var(--bg-simple)] rounded-lg p-6 border border-[var(--border-color)] shadow-sm h-auto md:h-full">
                <h3 className="text-lg font-medium text-[var(--font-color)] mb-6">Editar Perfil</h3>
                <ProfileForm
                  nome={perfil.nome}
                  email={perfil.email}
                  campus={perfil.campus}
                  descricao={perfil.descricao}
                  onNomeChange={(value) => setPerfil({ ...perfil, nome: value })}
                  onEmailChange={(value) => setPerfil({ ...perfil, email: value })}
                  onDescricaoChange={(value) => setPerfil({ ...perfil, descricao: value })}
                />
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="w-full px-6 sm:px-8 py-4 md:py-5 border-t flex flex-row justify-end gap-6 sm:gap-4">
          <Button
            className="w-[45%] xs:w-[160px] sm:w-[180px] md:w-[200px] h-10 xs:h-11 bg-[var(--button-color)] text-sm xs:text-base text-[var(--font-color2)] hover:bg-[var(--hover-3-color)] cursor-pointer"
          >
            Voltar
          </Button>
          <Button
            className="w-[45%] xs:w-[160px] sm:w-[180px] md:w-[200px] h-10 xs:h-11 bg-[var(--button-color)] text-sm xs:text-base text-[var(--font-color2)] hover:bg-[var(--hover-3-color)] cursor-pointer"
          >
            Salvar
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}