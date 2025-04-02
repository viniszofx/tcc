import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface AvatarProps {
    foto?: string;
  }

export default function ProfileAvatar({foto}: AvatarProps) {
  return (
    <div>
      <Avatar className="md:w-40 md:h-40 w-28 h-28 cursor-pointer border">
          <AvatarImage src={foto} alt="Foto do usuário" />
          <AvatarFallback></AvatarFallback>
        </Avatar>
    </div>
  )
}
