import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface AvatarProps {
    foto?: string;
}

export default function ProfileAvatar({ foto }: AvatarProps) {
    const [fotoSelecionada, setFotoSelecionada] = useState(foto);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFotoSelecionada(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="relative mb-10">
            <Avatar className="md:w-40 md:h-40 w-32 h-32 cursor-pointer border-2 border-[var(--border-color)]">
                <AvatarImage src={fotoSelecionada} alt="Foto do usuário" />
                <AvatarFallback className="bg-[var(--button-color)] text-[var(--font-color2)]">?</AvatarFallback>
            </Avatar>
            <a>
                <Button
                    className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[var(--button-color)] hover:bg-[var(--hover-3-color)] text-[var(--font-color2)] px-4 py-1 text-xs cursor-pointer rounded-full shadow-md transition-all opacity-100 sm:opacity-100"
                    size="sm"
                >
                    Alterar
                </Button>
            </a>

            <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
        </div>
    );
}
