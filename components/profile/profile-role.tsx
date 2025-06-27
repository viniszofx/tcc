"use client"

interface RoleProfileProps {
  role: string
}

export default function RoleProfile({ role }: RoleProfileProps) {
  return (
    <div className="w-full text-center font-bold text-lg md:text-xl mb-4 text-[var(--font-color)]">
      {role.toUpperCase()}
    </div>
  )
}