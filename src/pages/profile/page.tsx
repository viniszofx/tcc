import ProfileAvatar from "@/components/custom/profile-avatar";
import ProfileForm from "@/components/custom/profile-form";
import RoleProfile from "@/components/custom/profile-role";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";

export default function ProfilePage() {
    const [perfil, setPerfil] = useState({
        nome: "João Silva",
        email: "joao@email.com",
        campus: "IFMS Corumbá",
        descricao: "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    });

    return (
        <div className="w-full p-3 xs:p-4 sm:p-5 md:p-6 lg:p-8 flex items-center justify-center">
            <Card className="bg-[var(--bg-simple)] w-full max-w-[98%] xs:max-w-[95%] sm:max-w-[90%] md:max-w-[85%] overflow-auto lg:max-w-[calc(100%-var(--sidebar-width)-2rem)] mx-auto p-4 sm:p-6 lg:p-8 shadow-md rounded-lg flex flex-col h-full xs:min-h-[80vh] sm:min-h-[75vh] md:min-h-[70vh]">
                <div className="flex flex-col md:mt-20 sm:mt-10 md:flex-row gap-4 xs:gap-5 sm:gap-6 md:gap-8 lg:gap-10 flex-grow">
                    <div className="w-full md:w-1/3 flex flex-col items-center px-2 sm:px-4">
                        <div className="w-full flex flex-col items-center gap-4 xs:gap-5">
                            <RoleProfile cargo="admin" />
                            <ProfileAvatar foto="./logo.svg" />
                        </div>
                        <div className="w-full mt-4 xs:mt-5 sm:mt-6">
                            <p className="text-sm xs:text-base font-medium text-[var(--text-color)] mb-2">Descrição:</p>
                            <div className="p-3 xs:p-4 bg-[var(--bg-simple)] rounded-md min-h-20 border border-[var(--border-color)] text-sm xs:text-base">
                                {perfil.descricao || "Nenhuma descrição informada"}
                            </div>
                        </div>
                    </div>

                    <div className="hidden md:block h-auto w-px bg-gray-200 dark:bg-gray-700 mx-2" />

                    <div className="w-full md:w-2/3 px-2 sm:px-4">
                        <ProfileForm
                            nome={perfil.nome}
                            email={perfil.email}
                            campus={perfil.campus}
                            descricao={perfil.descricao}
                            onNomeChange={(value) => setPerfil({...perfil, nome: value})}
                            onEmailChange={(value) => setPerfil({...perfil, email: value})}
                            onDescricaoChange={(value) => setPerfil({...perfil, descricao: value})}
                        />
                    </div>
                </div>
                
                <div className="w-full md:pt-40 pt-4 flex xs:mt-7 sm:mt-8 md:mt-10 lg:mt-12 xs:pt-4 border-t justify-end gap-4">
                    <Button className="w-full xs:w-[180px] sm:w-[200px] h-10 xs:h-11 bg-[var(--button-color)] text-sm xs:text-base text-[var(--font-color2)] hover:bg-[var(--hover-3-color)] cursor-pointer">
                        Voltar
                    </Button>
                    <Button className="w-full xs:w-[180px] sm:w-[200px] h-10 xs:h-11 bg-[var(--button-color)] text-sm xs:text-base text-[var(--font-color2)] hover:bg-[var(--hover-3-color)] cursor-pointer">
                        Salvar Alterações
                    </Button>
                </div>
            </Card>
        </div>
    );
}