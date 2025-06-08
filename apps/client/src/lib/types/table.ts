// @file: client/src/lib/types/table.ts

export type TableColumn<T> = {
  /** Nagłówek kolumny */
  label: string
  /** Pole do sortowania lub klucz danych */
  field: keyof T | string
  /** Czy możliwe sortowanie po tej kolumnie */
  sortable?: boolean
  /** Własny renderer komórki */
  render?: (row: T, index: number) => React.ReactNode
}

export type TableProps<T> = {
  /** Dane do wyświetlenia */
  data: T[]
  /** Kolumny tabeli */
  columns: TableColumn<T>[]
  /** Klucz unikalny (np. id) */
  rowKey: (row: T) => string | number
  /** Aktualnie aktywne sortowanie (np. 'email:asc') */
  sort?: string
  /** Callback przy zmianie sortowania */
  onSortChange?: (field: string) => void
}
// EOF
