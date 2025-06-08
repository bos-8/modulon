export type PaginatorProps = {
  page: number
  limit: number
  total: number
  allowedLimits?: number[]
  onPageChange: (newPage: number) => void
  onLimitChange: (newLimit: number) => void
}