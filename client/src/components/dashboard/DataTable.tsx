import React from 'react'

export interface Column<T> {
  header: string
  accessor?: keyof T | ((row: T) => React.ReactNode)
  className?: string
  align?: 'left' | 'center' | 'right'
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (row: T) => string | number
  emptyState?: React.ReactNode
  isLoading?: boolean
  className?: string
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyState,
  isLoading = false,
  className = '',
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-[#E7E0D7] p-8 text-center">
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#C94F36] border-t-transparent" />
        <p className="text-xs text-[#74706A] mt-2">Loading data...</p>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      emptyState ? (
        <>{emptyState}</>
      ) : (
        <div className="bg-white rounded-lg border border-[#E7E0D7] p-8 text-center text-xs text-[#74706A]">
          No records found.
        </div>
      )
    )
  }

  return (
    <div className={`bg-white rounded-lg border border-[#E7E0D7] overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#FAF8F5] border-b border-[#E7E0D7]">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`px-4 py-3 text-[11px] font-semibold text-[#74706A] uppercase tracking-wider ${
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                  } ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E7E0D7] text-xs text-[#292826]">
            {data.map((row) => (
              <tr key={keyExtractor(row)} className="hover:bg-[#FAF8F5]/60 transition-colors">
                {columns.map((col, idx) => {
                  let cellContent: React.ReactNode = null
                  if (typeof col.accessor === 'function') {
                    cellContent = col.accessor(row)
                  } else if (col.accessor) {
                    cellContent = row[col.accessor] as unknown as React.ReactNode
                  }
                  return (
                    <td
                      key={idx}
                      className={`px-4 py-3.5 align-middle ${
                        col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                      } ${col.className || ''}`}
                    >
                      {cellContent}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
