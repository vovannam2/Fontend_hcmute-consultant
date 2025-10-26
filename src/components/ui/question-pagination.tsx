import { createSearchParams, useNavigate, useLocation } from 'react-router-dom'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Props {
  readonly path: string
  readonly pageSize: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly queryConfig: any
  readonly RANGE?: number
  readonly showChooseQuantity?: boolean
}

// if total page is 10
// page 1 active: 1 2 ... 9 10
// page 2 active: 1 2 3 4 ... 9 10
// page 3 active: 1 2 3 4 5 ... 9 10
// page 4 active: 1 2 3 4 5 6 ... 9 10
// page 5 active: 1 2 3 4 5 6 7 ... 9 10
// page 6 active: 1 2 ... 4 5 6 7 8 9 10
// page 7 active: 1 2 ... 5 6 7 8 9 10
// page 8 active: 1 2 ... 6 7 8 9 10
// page 9 active: 1 2 ... 7 8 9 10
// page 10 active: 1 2 ... 8 9 10

export default function QuestionPagination({ 
  path, 
  queryConfig, 
  pageSize, 
  RANGE = 2, 
  showChooseQuantity = true 
}: Props) {
  const navigate = useNavigate()
  const location = useLocation()
  const page = Number(queryConfig.page)

  const buildHref = (params: Record<string, string>) => {
    const search = createSearchParams(params).toString()
    return `${location.pathname}?${search}`
  }
  
  const renderPagination = () => {
    let dotAfter = false
    let dotBefore = false
    
    const renderDotBefore = () => {
      if (!dotBefore) {
        dotBefore = true
        return (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )
      }
      return null
    }

    const renderDotAfter = () => {
      if (!dotAfter) {
        dotAfter = true
        return (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )
      }
      return null
    }
    
    return Array(pageSize)
      .fill(1)
      .map((_, index) => {
        const pageNumber = index
        if (page <= RANGE * 2 + 1 && pageNumber > page + RANGE && pageNumber < pageSize - RANGE + 1) {
          return renderDotAfter()
        } else if (page > RANGE * 2 + 1 && page < pageSize - RANGE * 2) {
          if (pageNumber < page - RANGE && pageNumber > RANGE) {
            return renderDotBefore()
          } else if (pageNumber > page + RANGE && pageNumber <= pageSize - RANGE) {
            return renderDotAfter()
          }
        } else if (page >= pageSize - RANGE * 2 && pageNumber < page - RANGE && pageNumber > RANGE) {
          return renderDotBefore()
        }
        return (
          <PaginationItem key={pageNumber}>
            <PaginationLink
              to={buildHref({
                ...queryConfig,
                page: pageNumber.toString()
              })}
              isActive={page === pageNumber}
            >
              {pageNumber + 1}
            </PaginationLink>
          </PaginationItem>
        )
      })
  }

  const handleValueChange = (val: string) => {
    navigate({
      pathname: location.pathname,
      search: createSearchParams({
        ...queryConfig,
        page: '0',
        size: val
      }).toString()
    })
  }

  return (
    <div className="flex items-center justify-center relative w-full">
      <div>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                to={page > 0 ? buildHref({
                  ...queryConfig,
                  page: (page - 1).toString()
                }) : undefined}
                className={page === 0 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
            {renderPagination()}
            <PaginationItem>
              <PaginationNext
                to={page < pageSize - 1 ? buildHref({
                  ...queryConfig,
                  page: (page + 1).toString()
                }) : undefined}
                className={page >= pageSize - 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
      {showChooseQuantity && (
        <div className="absolute top-1/2 right-0 -translate-x-1/2 -translate-y-1/2">
          <Select defaultValue={queryConfig.size} onValueChange={handleValueChange}>
            <SelectTrigger className="w-20">
              <SelectValue placeholder="Size" />
            </SelectTrigger>
            <SelectContent>
              {Array(6)
                .fill(1)
                .map((item, index) => (
                  <SelectItem key={index} value={String(item * (index + 1) * 5)}>
                    {item * (index + 1) * 5}
                  </SelectItem>
                ))}
              <SelectItem value="1000000">All</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}
