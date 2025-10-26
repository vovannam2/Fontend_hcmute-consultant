import { getAllQuestionsByDepartment } from '@/apis/question.api'
import { getFields } from '@/apis/department.api'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Download, Upload, Search, Filter, MessageSquare } from 'lucide-react'
import path from '@/constants/path'
import useQuestionQueryConfig from '@/hooks/useQuestionQueryConfig'
import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { createSearchParams, useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { AppContext } from '@/contexts/app.context'
import { format } from 'date-fns'
import { Question } from '@/types/question.type'
import DialogAnswerQuestion from './components/DialogAnswerQuestion'

// QuestionFilter Component
function QuestionFilter({ queryConfig, path }: { queryConfig: any; path: string }) {
  const navigate = useNavigate()
  const { user } = useContext(AppContext)
  
  // Lấy fields theo department của user đăng nhập
  const { data: fieldsData, isLoading: fieldsLoading, error: fieldsError } = useQuery({
    queryKey: ['fields', (user as any)?.department],
    queryFn: () => getFields((user as any)?.department || ''),
    enabled: !!(user as any)?.department
  })
  const form = useForm({
    defaultValues: {
      status: queryConfig.status || 'all',
      title: queryConfig.title || '',
      fieldId: queryConfig.fieldId || 'all',
      startDate: queryConfig.startDate || '',
      endDate: queryConfig.endDate || ''
    }
  })

  const onSubmit = form.handleSubmit((values) => {
    
    const processedValues = { ...values }
    
    // Xử lý status: giữ nguyên status để backend xử lý bằng switch case
    if (processedValues.status === 'all') {
      delete processedValues.status
    }
    // Các status khác sẽ được giữ nguyên để backend xử lý
    
    // Xử lý fieldId: nếu là "all" thì không gửi
    if (processedValues.fieldId === 'all') {
      delete processedValues.fieldId
    }
    navigate({
      pathname: path,
      search: createSearchParams({
        ...queryConfig,
        ...processedValues
      }).toString()
    })
  })

  return (
    <div className='bg-white p-4 rounded-lg border'>
      <Form {...form}>
        <form onSubmit={onSubmit} className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tìm kiếm</FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <Search className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                      <Input
                        placeholder='Tìm kiếm theo tiêu đề...'
                        className='pl-10'
                        {...field}
                      />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            

            <FormField
              control={form.control}
              name='fieldId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lĩnh vực</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Chọn lĩnh vực' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='all'>Tất cả lĩnh vực</SelectItem>
                      {fieldsData?.data.data.map((field: any) => (
                        <SelectItem key={field.id} value={field.id}>
                          {field.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='status'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trạng thái</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Chọn trạng thái' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='all'>Tất cả câu hỏi</SelectItem>
                      <SelectItem value='ANSWERED'>Câu hỏi đã trả lời</SelectItem>
                      <SelectItem value='PENDING'>Câu hỏi chưa trả lời</SelectItem>
                      <SelectItem value='PRIVATE'>Câu hỏi riêng tư</SelectItem>
                      <SelectItem value='PUBLIC'>Câu hỏi công khai</SelectItem>
                      <SelectItem value='DELETED'>Câu hỏi đã xóa</SelectItem>
                      <SelectItem value='PENDING_APPROVAL'>Câu trả lời yêu cầu phê duyệt</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <div className='flex gap-2'>
              <Button type='submit' className='flex-1'>
                <Filter className='w-4 h-4 mr-2' />
                Lọc
              </Button>
              <Button type='button' variant='outline' onClick={() => form.reset()}>
                Reset
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}

// QuestionItem Component
function QuestionItem({ question }: { question: Question }) {
  const navigate = useNavigate()
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant='secondary' className='bg-orange-100 text-orange-800'>Chưa trả lời</Badge>
      case 'ANSWERED':
        return <Badge variant='secondary' className='bg-green-100 text-green-800'>Đã trả lời</Badge>
      case 'DELETED':
        return <Badge variant='destructive'>Đã xóa</Badge>
      default:
        return <Badge variant='outline'>{status}</Badge>
    }
  }

  // Xác định status dựa trên dữ liệu thực tế
  const getQuestionStatus = () => {
    // Kiểm tra nếu có câu trả lời
    if ((question as any).statusAnswer === true || question.answerContent) {
      return 'ANSWERED'
    }
    // Kiểm tra nếu bị xóa (sử dụng optional chaining)
    if ((question as any).statusDelete === true) {
      return 'DELETED'
    }
    // Mặc định là chưa trả lời
    return 'PENDING'
  }

  const questionStatus = getQuestionStatus()

  const handleQuestionClick = () => {
    navigate(path.questionDetail.replace(':id', question.id))
  }

  return (
    <div 
      className='hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent hover:shadow-lg rounded-lg py-4 px-6 border border-gray-200 transition-all duration-200 cursor-pointer group mb-3'
      onClick={handleQuestionClick}
    >
      {/* Header với badge và ngày */}
      <div className='flex items-center justify-between mb-3'>
        <div className='flex items-center gap-2'>
          <Badge 
            variant='outline' 
            className='bg-blue-50 text-blue-700 border-blue-200 font-medium'
          >
            {question.field?.name}
          </Badge>
          {getStatusBadge(questionStatus)}
        </div>
        <div className='flex items-center gap-2'>
          <span className='text-xs text-gray-500'>
            {format(new Date(question.createdAt), 'dd/MM/yyyy')}
          </span>
          <DialogAnswerQuestion question={question} />
        </div>
      </div>
      
      {/* Department and Title */}
      <div className='flex items-start gap-4'>
        <div className='flex-shrink-0 w-40'>
          <div className='text-sm font-medium text-gray-700'>
            {question.department?.name}
          </div>
          {question.originalDepartment && (
            <div className='text-xs text-orange-600 mt-1 font-medium'>
              📤 Chuyển từ: {question.originalDepartment.name}
            </div>
          )}
        </div>
        <div className='flex-1'>
          <h3 className='text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2'>
            {question.title}
          </h3>
          {/* Thêm một số thông tin bổ sung nếu có */}
          {question.askerFullName && (
            <p className='text-sm text-gray-500 mt-1'>
              👤 {question.askerFullName}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ExportCustom Component
function ExportCustom({ }: { dataType: string; queryConfig: any }) {
  const handleExport = () => {
    // Implement export functionality
  }

  return (
    <Button variant='outline' onClick={handleExport}>
      <Download className='w-4 h-4 mr-2' />
      Xuất file
    </Button>
  )
}

// ImportCustom Component
function ImportCustom() {
  const handleImport = () => {
    // Implement import functionality
  }

  return (
    <Button variant='outline' onClick={handleImport}>
      <Upload className='w-4 h-4 mr-2' />
      Nhập file
    </Button>
  )
}

// PaginationCustom Component
function PaginationCustom({ 
  path, 
  queryConfig, 
  pageSize 
}: { 
  path: string; 
  queryConfig: any; 
  pageSize: number 
}) {
  const navigate = useNavigate()
  const currentPage = queryConfig.page || 1

  const handlePageChange = (page: number) => {
    navigate({
      pathname: path,
      search: createSearchParams({
        ...queryConfig,
        page: page.toString()
      }).toString()
    })
  }

  if (!pageSize || pageSize <= 1) return null

  return (
    <div className='flex items-center justify-center space-x-2'>
      <Button
        variant='outline'
        size='sm'
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        Trước
      </Button>
      
      <div className='flex items-center space-x-1'>
        {Array.from({ length: Math.min(pageSize, 5) }, (_, i) => {
          const page = i + 1
          return (
            <Button
              key={page}
              variant={currentPage === page ? 'default' : 'outline'}
              size='sm'
              onClick={() => handlePageChange(page)}
            >
              {page}
            </Button>
          )
        })}
      </div>
      
      <Button
        variant='outline'
        size='sm'
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage >= pageSize}
      >
        Sau
      </Button>
    </div>
  )
}

export default function ManageQuestion() {
  const questionQueryConfig = useQuestionQueryConfig()
  if (questionQueryConfig.status === 'APPROVED') {
    questionQueryConfig.statusApproval = 'true'
  }

  const { data: questions, isLoading } = useQuery({
    queryKey: ['questions', questionQueryConfig],
    queryFn: () => getAllQuestionsByDepartment(questionQueryConfig)
  })

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='font-semibold text-lg'>Câu hỏi</h1>
            <p className='text-sm italic'>Quản lý câu hỏi</p>
          </div>
        </div>
        <div className='flex items-center justify-center py-12'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
            <p className='mt-2 text-gray-600'>Đang tải...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='font-semibold text-lg'>Câu hỏi</h1>
          <p className='text-sm italic'>Quản lý câu hỏi</p>
        </div>
        <div className='flex gap-2'>
          <ExportCustom dataType='question' queryConfig={questionQueryConfig} />
          <ImportCustom />
        </div>
      </div>
      
      <QuestionFilter queryConfig={questionQueryConfig} path={path.manageQuestion} />
      
      <Separator />
      
      <div className='rounded-lg shadow-sm bg-white border p-4'>
        {questions?.data.data.content.length === 0 ? (
          <div className='text-center py-12'>
            <MessageSquare className='w-12 h-12 text-gray-400 mx-auto mb-4' />
            <p className='text-gray-600'>Không có câu hỏi nào</p>
          </div>
        ) : (
          questions?.data.data.content.map((question) => {
            return <QuestionItem key={question.id} question={question} />
          })
        )}
      </div>
      
      <PaginationCustom
        path={path.manageQuestion}
        queryConfig={questionQueryConfig}
        pageSize={questions?.data.data.totalPages as number}
      />
    </div>
  )
}
