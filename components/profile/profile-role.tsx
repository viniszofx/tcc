"use client"

interface RoleProfileProps {
  papel: string;
}

export default function RoleProfile({ papel }: RoleProfileProps) {
  return (
    <div className="w-full text-center font-bold text-lg md:text-xl mb-4 text-[var(--font-color)]">
      {papel.toUpperCase()}
    </div>
  )
}