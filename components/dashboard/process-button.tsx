"use client"

import { Button } from "@/components/ui/button"

interface ProcessButtonProps {
  onClick: () => void
  disabled: boolean
  isProcessing: boolean
}

export default function ProcessButton({ onClick, disabled, isProcessing }: ProcessButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className="group relative w-full overflow-hidden bg-[var(--button-color)] px-8 py-6 text-[var(--font-color2)] transition-all hover:bg-[var(--hover-3-color)] hover:text-white sm:w-auto md:text-lg lg:text-xl disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {isProcessing ? (
          <>
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Processando...
          </>
        ) : (
          "Processar"
        )}
      </span>
      <span className="absolute bottom-0 left-0 h-1 w-full bg-white/20 transition-all duration-300 group-hover:h-full"></span>
    </Button>
  )
}