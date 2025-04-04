import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Upload } from "lucide-react"

export default function DashboardPage() {
  return (
    <Card className="w-full max-w-3xl bg-[var(--bg-simple)] shadow-md lg:max-w-5xl xl:max-w-6xl">
      <CardHeader className="pb-2 text-center">
        <CardTitle className="text-xl font-bold text-[var(--font-color)] md:text-2xl lg:text-3xl">
          Processamento de Arquivo
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-8">
        <Card className="flex flex-col items-center justify-center border-dashed border-[var(--border-input)] bg-[var(--card-color)] p-6 md:p-8 lg:p-10 text-center">
          <div className="mb-4 rounded-full bg-[var(--bg-simple)] p-3">
            <Upload className="h-8 w-8 text-[var(--button-color)]" />
          </div>

          <CardTitle className="mb-2 text-lg text-[var(--font-color)] md:text-xl lg:text-2xl">
            Arraste seu arquivo CSV ou Excel
          </CardTitle>

          <p className="mb-4 text-sm text-[var(--font-color)]/70 md:text-base">ou clique para selecionar um arquivo</p>

          <Input
            id="file"
            type="file"
            className="w-full max-w-md lg:max-w-lg bg-[var(--bg-simple)] text-sm"
            accept=".csv, .xls, .xlsx"
          />
        </Card>

        <div className="flex items-center justify-between rounded-lg bg-[var(--card-color)] p-4 lg:p-6">
          <div>
            <h3 className="text-base font-semibold text-[var(--font-color)] md:text-lg lg:text-xl">
              Habilitar Aceleração de Hardware
            </h3>
            <p className="text-sm text-[var(--font-color)]/70 md:text-base">
              Acelera o processamento usando recursos do hardware
            </p>
          </div>
          <Switch
            id="hardware"
            className="data-[state=checked]:bg-[var(--button-color)] scale-100 md:scale-110 lg:scale-125"
          />
        </div>

        <div className="flex justify-end border-t pt-4 lg:pt-6">
          <Button className="w-full bg-[var(--button-color)] px-8 py-6 text-[var(--font-color2)] transition-all hover:bg-[var(--hover-3-color)] hover:text-white sm:w-auto md:text-lg lg:text-xl cursor-pointer">
            Processar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}