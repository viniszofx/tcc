import Image from "next/image"

export default function LoadingScreen() {
  return (
    <div className="p-4 flex flex-col items-center justify-center gap-4">
      <div className="relative h-16 w-16 animate-spin">
        <Image src="/logo.svg" alt="Carregando..." fill />
      </div>
      <p className="text-center text-[var(--font-color)]">Carregando...</p>
    </div>
  )
}