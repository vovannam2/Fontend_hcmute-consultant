import { isUndefined, omitBy } from 'lodash'

import useQueryParams from '@/hooks/useQueryParams'
import { ForwardQuestionListConfig } from '@/types/params.type'

export type ForwardQuestionQueryConfig = {
  [key in keyof ForwardQuestionListConfig]: string
}
export default function useForwardQuestionQueryConfig() {
  const queryParams = useQueryParams() as Partial<ForwardQuestionQueryConfig>

  // Convert page from 1-based (URL) to 0-based (backend)
  const pageFromUrl = queryParams.page ?? '1'
  const pageForBackend = String(Math.max(0, Number(pageFromUrl) - 1))
  
  const queryConfig: ForwardQuestionQueryConfig = omitBy(
    {
      page: pageForBackend,
      size: queryParams.size ?? '5',
      sortBy: queryParams.sortBy ?? 'title',
      sortDir: queryParams.sortDir ?? 'desc',
      title: queryParams?.title,
      startDate: queryParams?.startDate,
      endDate: queryParams.endDate
    },
    isUndefined
  ) as ForwardQuestionQueryConfig
  return queryConfig
}
