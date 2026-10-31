export type PaginationItem = number | 'ellipsis'

const WINDOW_THRESHOLD = 7

export const paginationWindow = (current: number, total: number): PaginationItem[] => {
  if (total <= WINDOW_THRESHOLD) return Array.from({ length: total }, (_, index) => index + 1)

  const pages = [1, current - 1, current, current + 1, total].filter(
    (page, index, all) => page >= 1 && page <= total && all.indexOf(page) === index,
  )

  return pages.flatMap((page, index): PaginationItem[] => {
    const previous = pages[index - 1]
    return previous !== undefined && page - previous > 1 ? ['ellipsis', page] : [page]
  })
}
