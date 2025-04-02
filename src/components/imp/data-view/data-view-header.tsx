"use client"

import { useDrag, useDrop } from "react-dnd"
import { Eye, EyeOff, GripVertical } from "lucide-react"
import type { DataViewColumn } from "./types"
import { Button } from "@/components/ui/button"

interface DataViewHeaderProps {
  columns: DataViewColumn[]
  onColumnsChange: (columns: DataViewColumn[]) => void
}

interface DragItem {
  type: string
  index: number
  id: string
}

export function DataViewHeader({ columns, onColumnsChange }: DataViewHeaderProps) {
  const moveColumn = (dragIndex: number, hoverIndex: number) => {
    const newColumns = [...columns]
    const dragColumn = newColumns[dragIndex]
    newColumns.splice(dragIndex, 1)
    newColumns.splice(hoverIndex, 0, dragColumn)
    onColumnsChange(newColumns)
  }

  const toggleColumnVisibility = (columnKey: string) => {
    const newColumns = columns.map((col) => (col.key === columnKey ? { ...col, isVisible: !col.isVisible } : col))
    onColumnsChange(newColumns)
  }

  return (
    <div className="flex border-b bg-muted/50 px-4 py-2">
      {columns.map((column, index) => (
        <ColumnHeader
          key={column.key}
          index={index}
          column={column}
          moveColumn={moveColumn}
          onToggleVisibility={() => toggleColumnVisibility(column.key)}
        />
      ))}
    </div>
  )
}

interface ColumnHeaderProps {
  index: number
  column: DataViewColumn
  moveColumn: (dragIndex: number, hoverIndex: number) => void
  onToggleVisibility: () => void
}

function ColumnHeader({ index, column, moveColumn, onToggleVisibility }: ColumnHeaderProps) {
  const [{ isDragging }, drag, dragPreview] = useDrag({
    type: "COLUMN",
    item: { type: "COLUMN", index, id: column.key },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const [, drop] = useDrop({
    accept: "COLUMN",
    hover(item: DragItem, monitor) {
      if (!monitor.isOver({ shallow: true })) return
      const dragIndex = item.index
      const hoverIndex = index
      if (dragIndex === hoverIndex) return
      moveColumn(dragIndex, hoverIndex)
      item.index = hoverIndex
    },
  })

  return (
    <div
      ref={(node) => drop(dragPreview(node))}
      className={`flex flex-1 items-center gap-2 px-2 ${isDragging ? "opacity-50" : ""}`}
      style={{ width: column.width }}
    >
      <div ref={drag} className="cursor-move">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      <span className="flex-1 text-sm font-medium">{column.label}</span>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={(e) => {
          e.stopPropagation()
          onToggleVisibility()
        }}
      >
        {column.isVisible ? (
          <Eye className="h-4 w-4 text-muted-foreground" />
        ) : (
          <EyeOff className="h-4 w-4 text-muted-foreground" />
        )}
      </Button>
    </div>
  )
}

