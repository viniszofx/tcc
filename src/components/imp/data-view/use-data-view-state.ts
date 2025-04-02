"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import type { DataViewColumn, DataViewFilter, SavedView } from "./types"

const SAVED_VIEWS_KEY = "saturn:saved-views"
const CURRENT_VIEW_KEY = "saturn:current-view"

export function useDataViewState(data: any[]) {
  // Estado para colunas
  const [columns, setColumns] = useState<DataViewColumn[]>(() => {
    if (!data.length) return []
    return Object.keys(data[0]).map((key) => ({
      key,
      label: key,
      width: "200px",
      isVisible: true,
    }))
  })

  // Estado para filtros
  const [filters, setFilters] = useState<DataViewFilter[]>([])

  // Estado para agrupamento
  const [groupBy, setGroupBy] = useState<string | null>(null)

  // Estado para visualizações salvas
  const [savedViews, setSavedViews] = useState<SavedView[]>(() => {
    if (typeof window === "undefined") return []
    const saved = localStorage.getItem(SAVED_VIEWS_KEY)
    return saved ? JSON.parse(saved) : []
  })

  // Carregar visualização atual do localStorage
  useEffect(() => {
    const savedCurrentView = localStorage.getItem(CURRENT_VIEW_KEY)
    if (savedCurrentView) {
      const view = JSON.parse(savedCurrentView)
      setColumns(view.columns)
      setFilters(view.filters)
      setGroupBy(view.groupBy)
    }
  }, [])

  // Salvar visualização atual no localStorage
  useEffect(() => {
    const currentView = {
      columns,
      filters,
      groupBy,
    }
    localStorage.setItem(CURRENT_VIEW_KEY, JSON.stringify(currentView))
  }, [columns, filters, groupBy])

  // Salvar visualizações no localStorage
  useEffect(() => {
    localStorage.setItem(SAVED_VIEWS_KEY, JSON.stringify(savedViews))
  }, [savedViews])

  // Função para salvar visualização atual
  const saveCurrentView = useCallback(
    (name: string) => {
      const newView: SavedView = {
        id: Date.now(),
        name,
        columns,
        filters,
        groupBy,
      }
      setSavedViews((prev) => [...prev, newView])
    },
    [columns, filters, groupBy],
  )

  // Função para carregar visualização salva
  const loadView = useCallback(
    (viewId: number) => {
      const view = savedViews.find((v) => v.id === viewId)
      if (view) {
        setColumns(view.columns)
        setFilters(view.filters)
        setGroupBy(view.groupBy)
      }
    },
    [savedViews],
  )

  // Aplicar filtros aos dados
  const filteredData = useMemo(() => {
    return data.filter((item) =>
      filters.every((filter) => {
        const value = item[filter.column]
        const filterValue = filter.value.toLowerCase()

        switch (filter.operator) {
          case "equals":
            return value?.toString().toLowerCase() === filterValue
          case "not_equals":
            return value?.toString().toLowerCase() !== filterValue
          case "contains":
            return value?.toString().toLowerCase().includes(filterValue)
          case "not_contains":
            return !value?.toString().toLowerCase().includes(filterValue)
          case "starts_with":
            return value?.toString().toLowerCase().startsWith(filterValue)
          case "ends_with":
            return value?.toString().toLowerCase().endsWith(filterValue)
          case "is_empty":
            return !value || value.toString().trim() === ""
          case "is_not_empty":
            return value && value.toString().trim() !== ""
          default:
            return true
        }
      }),
    )
  }, [data, filters])

  // Agrupar dados filtrados
  const groupedData = useMemo(() => {
    if (!groupBy) return {}

    return filteredData.reduce((groups: Record<string, any[]>, item) => {
      const groupValue = item[groupBy]?.toString() || ""
      if (!groups[groupValue]) {
        groups[groupValue] = []
      }
      groups[groupValue].push(item)
      return groups
    }, {})
  }, [filteredData, groupBy])

  return {
    columns,
    setColumns,
    filters,
    setFilters,
    groupBy,
    setGroupBy,
    savedViews,
    saveCurrentView,
    loadView,
    filteredData,
    groupedData,
  }
}

