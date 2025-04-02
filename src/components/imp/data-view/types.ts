export interface DataViewColumn {
  key: string
  label: string
  width: string
  isVisible: boolean
}

export interface DataViewFilter {
  id: number
  column: string
  operator: string
  value: string
}

export interface SavedView {
  id: number
  name: string
  columns: DataViewColumn[]
  filters: DataViewFilter[]
  groupBy: string | null
}

