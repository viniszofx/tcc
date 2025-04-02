import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface AvatarProps {
    foto?: string;
}

export default function ProfileAvatar({ foto }: AvatarProps) {
    return (
        <div className="relative group">
            <Avatar className="md:w-40 md:h-40 w-32 h-32 cursor-pointer border-2 border-[var(--border-color)]">
                <AvatarImage src={foto} alt="Foto do usuário" />
                <AvatarFallback className="bg-[var(--button-color)] text-[var(--font-color2)]">?</AvatarFallback>
            </Avatar>
            <Button 
                className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[var(--button-color)] hover:bg-[var(--hover-3-color)] text-[var(--font-color2)] px-4 py-1 text-xs cursor-pointer rounded-full shadow-md transition-all opacity-0 group-hover:opacity-100"
                size="sm">
                Alterar
            </Button>
        </div>
    )
}
