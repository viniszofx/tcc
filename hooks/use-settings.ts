"use client"

import { useEffect, useState } from "react"

export function useSettings() {
  const [hardwareAcceleration, setHardwareAcceleration] = useState(true)
  
  useEffect(() => {
    const saved = localStorage.getItem('hardwareAcceleration')
    if (saved !== null) {
      setHardwareAcceleration(saved === 'true')
    }
  }, [])
  
  const updateHardwareAcceleration = (value: boolean) => {
    setHardwareAcceleration(value)
    localStorage.setItem('hardwareAcceleration', value.toString())
  }

  return {
    hardwareAcceleration,
    setHardwareAcceleration: updateHardwareAcceleration
  }
}