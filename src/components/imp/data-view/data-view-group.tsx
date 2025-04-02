"use client"

import { useState } from "react"
import { ChevronRight, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { DataViewColumn } from "./types"

interface DataViewGroupProps {
  groupValue: string
  items: any[]
  columns: DataViewColumn[]
  groupBy: string
}

export function DataViewGroup({ groupValue, items, columns, groupBy }: DataViewGroupProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const groupColumn = columns.find((col) => col.key === groupBy)
  const visibleColumns = columns.filter((col) => col.isVisible && col.key !== groupBy)

  return (
    <div>
      <Button
        variant="ghost"
        className="w-full justify-start rounded-none px-4 py-2 font-normal hover:no-underline"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? <ChevronDown className="mr-2 h-4 w-4" /> : <ChevronRight className="mr-2 h-4 w-4" />}
        <span className="font-medium">{groupColumn?.label}:</span>
        <span className="ml-2">{groupValue || "Sem valor"}</span>
        <span className="ml-2 text-muted-foreground">({items.length})</span>
      </Button>

      {isExpanded && (
        <div className="divide-y bg-muted/50">
          {items.map((item, index) => (
            <div key={index} className="flex px-4 py-2 pl-10">
              {visibleColumns.map((column) => (
                <div key={column.key} className="flex-1 truncate px-2" style={{ width: column.width }}>
                  {item[column.key]?.toString() || "-"}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

