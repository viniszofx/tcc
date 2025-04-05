"use client"

import { Button } from "@/components/ui/button"

interface ProfileActionsProps {
  onSave: () => void
  onBack: () => void
  isSaving: boolean
}

export default function ProfileActions({ onSave, onBack, isSaving }: ProfileActionsProps) {
  return (
    <div className="w-full px-6 sm:px-8 py-4 md:py-5 border-t flex flex-row justify-end gap-6 sm:gap-4">
      <Button
        onClick={onBack}
        className="w-[45%] xs:w-[160px] sm:w-[180px] md:w-[200px] h-10 xs:h-11 bg-[var(--button-color)] text-sm xs:text-base text-[var(--font-color2)] hover:bg-[var(--hover-3-color)] cursor-pointer"
        disabled={isSaving}
      >
        Voltar
      </Button>
      <Button
        onClick={onSave}
        className="w-[45%] xs:w-[160px] sm:w-[180px] md:w-[200px] h-10 xs:h-11 bg-[var(--button-color)] text-sm xs:text-base text-[var(--font-color2)] hover:bg-[var(--hover-3-color)] cursor-pointer"
        disabled={isSaving}
      >
        {isSaving ? "Salvando..." : "Salvar"}
      </Button>
    </div>
  )
}