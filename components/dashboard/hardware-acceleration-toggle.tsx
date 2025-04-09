import { Switch } from "@/components/ui/switch"
import { Cpu } from "lucide-react"

interface HardwareAccelerationToggleProps {
  enabled: boolean
  onToggle: (enabled: boolean) => void
  description?: string
}

export default function HardwareAccelerationToggle({
  enabled,
  onToggle,
  description = "Acelera o processamento usando algoritmos otimizados",
}: HardwareAccelerationToggleProps) {
  return (
    <div className="overflow-hidden rounded-xl bg-[var(--card-color)] shadow-md transition-all duration-300 hover:shadow-lg">
      <div className="flex items-center justify-between p-4 lg:p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-[var(--bg-simple)] p-2">
            <Cpu className="h-5 w-5 text-[var(--button-color)]" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[var(--font-color)] md:text-lg lg:text-xl">
              Aceleração de Hardware
            </h3>
            <p className="text-sm text-[var(--font-color)]/70 md:text-base">{description}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Switch
            id="hardware"
            checked={enabled}
            onCheckedChange={onToggle}
            className="data-[state=checked]:bg-[var(--button-color)] scale-100 md:scale-110 lg:scale-125"
          />
          <span className="text-xs text-[var(--font-color)]/50">{enabled ? "Ativado" : "Desativado"}</span>
        </div>
      </div>

      {enabled && (
        <div className="bg-[var(--button-color)]/5 px-6 py-3 border-t border-[var(--border-input)]">
          <p className="text-xs text-[var(--font-color)]/80">
            ⚡ A aceleração de hardware pode reduzir o tempo de processamento em até 70% para arquivos grandes.
          </p>
        </div>
      )}
    </div>
  )
}