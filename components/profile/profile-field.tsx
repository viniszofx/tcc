"use client"

import type React from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle } from "lucide-react"
import { useEffect, useState } from "react"

interface ProfileFieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  maxLength?: number
  disabled?: boolean
  type?: string
  placeholder?: string
  isTextarea?: boolean
  validator?: (value: string) => boolean
  errorMessage?: string
}

export default function ProfileField({
  id,
  label,
  value,
  onChange,
  maxLength,
  disabled = false,
  type = "text",
  placeholder = "",
  isTextarea = false,
  validator,
  errorMessage = "Formato inválido",
}: ProfileFieldProps) {
  const [inputValue, setInputValue] = useState(value)
  const [charCount, setCharCount] = useState(value.length)
  const [isLimitReached, setIsLimitReached] = useState(false)
  const [isValid, setIsValid] = useState(true)

  useEffect(() => {
    if (maxLength) {
      setIsLimitReached(value.length >= maxLength)
    }
    if (validator) {
      setIsValid(value === "" || validator(value))
    }
    setCharCount(value.length)
  }, [value, maxLength, validator])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value

    const sanitizedValue = type === "email" ? newValue.replace(/[^a-zA-Z0-9@._-]/g, "") : newValue

    setInputValue(sanitizedValue)

    if (!maxLength || sanitizedValue.length <= maxLength) {
      setCharCount(sanitizedValue.length)

      if (validator) {
        const isValidValue = sanitizedValue === "" || validator(sanitizedValue)
        setIsValid(isValidValue)

        if (isValidValue || sanitizedValue === "") {
          onChange(sanitizedValue)
        }
      } else {
        onChange(sanitizedValue)
      }
    }

    if (maxLength) {
      setIsLimitReached(sanitizedValue.length >= maxLength)
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium text-[var(--font-color)]">
        {label}
      </Label>

      {isTextarea ? (
        <div className="relative w-full" style={{ height: "150px" }}>
          <Textarea
            id={id}
            value={inputValue}
            onChange={handleChange}
            maxLength={maxLength}
            disabled={disabled}
            placeholder={placeholder}
            className={`absolute inset-0 w-full h-full bg-[var(--bg-simple)] border-[var(--border-input)] text-[var(--font-color)] resize-none ${!isValid ? "border-red-500" : ""} ${disabled ? "opacity-70" : ""}`}
            style={{
              overflowY: "auto",
              wordBreak: "break-word",
              whiteSpace: "pre-wrap",
            }}
          />
          {maxLength && (
            <div className="absolute bottom-2 right-2 text-xs text-[var(--font-color)]/70 bg-[var(--bg-simple)] px-1 rounded">
              {charCount}/{maxLength}
            </div>
          )}
        </div>
      ) : (
        <Input
          id={id}
          type={type}
          value={inputValue}
          onChange={handleChange}
          maxLength={maxLength}
          disabled={disabled}
          placeholder={placeholder}
          className={`bg-[var(--bg-simple)] border-[var(--border-input)] text-[var(--font-color)] w-full ${!isValid ? "border-red-500" : ""} ${disabled ? "opacity-70" : ""}`}
        />
      )}

      {!isValid && inputValue !== "" && (
        <div className="flex items-center mt-1 text-red-500 text-xs">
          <AlertCircle className="h-3 w-3 mr-1" />
          {errorMessage}
        </div>
      )}

      {isLimitReached && (
        <div className="flex items-center mt-1 text-amber-500 text-xs">
          <AlertCircle className="h-3 w-3 mr-1" />
          Limite máximo de caracteres atingido
        </div>
      )}
    </div>
  )
}