"use client"

import type React from "react"

import { CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { CheckCircle2, FileText, Upload } from "lucide-react"
import { useRef, useState } from "react"

interface FileUploadAreaProps {
  file: File | null
  onFileChange: (file: File) => void
}

export default function FileUploadArea({ file, onFileChange }: FileUploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileChange(e.target.files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileChange(e.dataTransfer.files[0])
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " bytes"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / 1048576).toFixed(2) + " MB"
  }
  const getFileIcon = () => {
    if (!file) return <Upload className="h-8 w-8 text-[var(--button-color)]" />

    const extension = file.name.split(".").pop()?.toLowerCase()

    if (extension === "csv") {
      return <FileText className="h-8 w-8 text-green-500" />
    } else if (["xls", "xlsx"].includes(extension || "")) {
      return <FileText className="h-8 w-8 text-blue-500" />
    } else {
      return <FileText className="h-8 w-8 text-[var(--button-color)]" />
    }
  }

  return (
    <div
      className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 md:p-8 lg:p-10 text-center transition-all duration-300 ${
        isDragging
          ? "border-[var(--button-color)] bg-[var(--button-color)]/5"
          : "border-[var(--border-input)] bg-[var(--card-color)]"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleUploadClick}
    >
      {file ? (
        <>
          <div className="mb-4 rounded-full bg-[var(--bg-simple)] p-4 shadow-md transition-transform duration-300 hover:scale-110">
            {getFileIcon()}
          </div>
          <div className="relative mb-2 inline-flex items-center">
            <CardTitle className="text-lg text-[var(--font-color)] md:text-xl lg:text-2xl">{file.name}</CardTitle>
            <CheckCircle2 className="ml-2 h-5 w-5 text-green-500" />
          </div>
          <p className="mb-4 text-sm text-[var(--font-color)]/70 md:text-base">
            {formatFileSize(file.size)} • Clique para trocar o arquivo
          </p>
        </>
      ) : (
        <>
          <div className="mb-4 rounded-full bg-[var(--bg-simple)] p-4 shadow-md transition-transform duration-300 hover:scale-110">
            <Upload className="h-8 w-8 text-[var(--button-color)]" />
          </div>
          <CardTitle className="mb-2 text-lg text-[var(--font-color)] md:text-xl lg:text-2xl">
            Arraste seu arquivo CSV ou Excel
          </CardTitle>
          <p className="mb-4 text-sm text-[var(--font-color)]/70 md:text-base">ou clique para selecionar um arquivo</p>
        </>
      )}

      <Input
        ref={fileInputRef}
        id="file"
        type="file"
        className="hidden"
        accept=".csv, .xls, .xlsx"
        onChange={handleFileChange}
      />

      {isDragging && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-[var(--button-color)]/10 backdrop-blur-sm">
          <p className="text-lg font-medium text-[var(--button-color)]">Solte o arquivo aqui</p>
        </div>
      )}

      <div className="mt-2 text-xs text-[var(--font-color)]/50">Formatos suportados: CSV, XLS, XLSX</div>
    </div>
  )
}
