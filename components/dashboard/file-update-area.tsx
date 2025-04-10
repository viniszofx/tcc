"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FileSpreadsheet, Upload, X } from "lucide-react"
import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"

interface FileUploadAreaProps {
  file: File | null
  onFileChange: (file: File) => void
}

export default function FileUploadArea({ file, onFileChange }: FileUploadAreaProps) {
  const [dragActive, setDragActive] = useState(false)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileChange(acceptedFiles[0])
      }
    },
    [onFileChange],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "text/csv": [".csv"],
    },
    multiple: false,
  })

  const handleRemoveFile = () => {
    onFileChange(null as unknown as File)
  }

  return (
    <div className="w-full">
      {!file ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? "border-[var(--button-color)] bg-[var(--button-color)]/10"
              : "border-[var(--border-input)] hover:border-[var(--button-color)] hover:bg-[var(--button-color)]/5"
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center gap-2">
            <Upload className="h-10 w-10 text-[var(--font-color)]/50" />
            <h3 className="text-lg font-medium text-[var(--font-color)]">Arraste e solte seu arquivo aqui</h3>
            <p className="text-sm text-[var(--font-color)]/70">ou</p>
            <Button
              type="button"
              className="mt-2 bg-[var(--button-color)] text-[var(--font-color2)] hover:bg-[var(--hover-2-color)] hover:text-white"
            >
              Selecionar Arquivo
            </Button>
            <p className="mt-2 text-xs text-[var(--font-color)]/50">Formatos suportados: XLSX, XLS, CSV</p>
          </div>
        </div>
      ) : (
        <Card className="border-[var(--border-input)] bg-[var(--card-color)]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--button-color)]/10">
                  <FileSpreadsheet className="h-5 w-5 text-[var(--button-color)]" />
                </div>
                <div>
                  <p className="font-medium text-[var(--font-color)]">{file.name}</p>
                  <p className="text-xs text-[var(--font-color)]/70">
                    {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type || "Planilha"}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRemoveFile}
                className="text-[var(--font-color)]/70 hover:bg-red-500/10 hover:text-red-500"
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Remover arquivo</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}