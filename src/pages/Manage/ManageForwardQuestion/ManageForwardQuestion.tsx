import { getForwardQuestion } from '@/apis/question.api'
import { Separator } from '@/components/ui/separator'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import path from '@/constants/path'
import useForwardQuestionQueryConfig from '@/hooks/useForwardQuestionQueryConfig'
import ForwardQuestionTable from '@/pages/Manage/ManageForwardQuestion/components/ForwardQuestionTable'
import ManageForwardQuestionFilter from '@/pages/Manage/ManageForwardQuestion/components/ManageForwardQuestionFilter'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams, useNavigate } from 'react-router-dom'

export default function ManageForwardQuestion() {
  const forwardQuestionQueryConfig = useForwardQuestionQueryConfig()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const currentPage = Number(searchParams.get('page')) || 1
  
  const { data: forwardQuestions, isLoading, error } = useQuery({
    queryKey: ['forward-questions', forwardQuestionQueryConfig],
    queryFn: () => getForwardQuestion(forwardQuestionQueryConfig)
  })


  const totalPages = forwardQuestions?.data.data.totalPages || 0

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    navigate(`${path.manageForwardQuestion}?${params.toString()}`)
  }

  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    return `${path.manageForwardQuestion}?${params.toString()}`
  }

  return (
    <div className='space-y-6'>
      <div>
        <div>
          <h1 className='font-semibold text-lg'>Câu hỏi chuyển tiếp</h1>
          <p className='text-sm italic'>Quản lý câu hỏi chuyển tiếp</p>
        </div>
      </div>
      <div>
        <ManageForwardQuestionFilter queryConfig={forwardQuestionQueryConfig} />
      </div>
      <Separator className='my-2' />
      <div>
        {isLoading ? (
          <div className='flex items-center justify-center py-8'>
            <div className='text-center'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
              <p className='mt-2 text-gray-600'>Đang tải...</p>
            </div>
          </div>
        ) : error ? (
          <div className='text-center py-8'>
            <p className='text-red-600'>Lỗi: {error.message}</p>
          </div>
        ) : (
          <ForwardQuestionTable forwardQuestions={forwardQuestions?.data.data.content} />
        )}
      </div>
      <div className='flex justify-center'>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-2 rounded-md ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50 cursor-pointer'}`}
              >
                Trước
              </button>
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <button
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 rounded-md ${currentPage === page ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  {page}
                </button>
              </PaginationItem>
            ))}
            <PaginationItem>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-2 rounded-md ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50 cursor-pointer'}`}
              >
                Sau
              </button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}
