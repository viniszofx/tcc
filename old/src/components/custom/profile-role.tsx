interface RoleProfileProps {
  cargo: "admin" | "operador" | "presidente";
}

export default function RoleProfile({ cargo }: RoleProfileProps) {
  return (
      <div className="w-full text-center font-bold text-lg md:text-xl mb-4 text-[var(--font-color)]">
          {cargo.toUpperCase()}
      </div>
  )
}
