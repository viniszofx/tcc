import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface AvatarProps {
    foto?: string;
  }

export default function ProfileAvatar({foto}: AvatarProps) {
  return (
    <div>
      <Avatar className="w-40 h-40 cursor-pointer border">
          <AvatarImage src={foto} alt="Foto do usuário" />
          <AvatarFallback></AvatarFallback>
        </Avatar>
    </div>
  )
}
