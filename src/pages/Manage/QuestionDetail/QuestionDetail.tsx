import { answerTheQuestion, approvalAnswer, getDeleteLog, getQuestionById, forwardQuestion } from '@/apis/question.api'
import { getAllDepartments } from '@/apis/department.api'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from '@/components/ui/dialog'
// Alert component - using div instead of Alert component
import path from '@/constants/path'
import { ROLE, Role } from '@/constants/role'
import { AppContext } from '@/contexts/app.context'
import { toast } from 'sonner'
import useQueryParams from '@/hooks/useQueryParams'
import { Answer } from '@/types/question.type'
import { formatDate } from '@/utils/utils'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangleIcon, BanIcon, EllipsisIcon, ReplyIcon, User, Calendar, Building2, Tag, Paperclip, Send, Trash2, Forward, RotateCcw, MessageSquare, FileText, Download } from 'lucide-react'
import { useContext, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'

// Simple Rich Text Editor Component
function SimpleEditor({ 
  value, 
  onChange, 
  placeholder = "Nhập nội dung trả lời..." 
}: { 
  value: string | undefined; 
  onChange: (value: string) => void; 
  placeholder?: string;
}) {
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)

  const handleFormat = (format: 'bold' | 'italic') => {
    const textarea = document.getElementById('answer-content') as HTMLTextAreaElement
    if (!textarea || !value) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const currentValue = value || ''
    const selectedText = currentValue.substring(start, end)
    
    let newText = ''
    if (format === 'bold') {
      newText = `<strong>${selectedText}</strong>`
      setIsBold(!isBold)
    } else if (format === 'italic') {
      newText = `<em>${selectedText}</em>`
      setIsItalic(!isItalic)
    }
    
    const newValue = currentValue.substring(0, start) + newText + currentValue.substring(end)
    onChange(newValue)
  }

  return (
    <div className='border rounded-lg'>
      <div className='flex items-center gap-2 p-2 border-b bg-gray-50'>
        <Button
          type='button'
          variant={isBold ? 'default' : 'ghost'}
          size='sm'
          onClick={() => handleFormat('bold')}
          className='h-8 px-2'
        >
          <strong>B</strong>
        </Button>
        <Button
          type='button'
          variant={isItalic ? 'default' : 'ghost'}
          size='sm'
          onClick={() => handleFormat('italic')}
          className='h-8 px-2'
        >
          <em>I</em>
        </Button>
      </div>
      <Textarea
        id='answer-content'
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className='min-h-[200px] border-0 resize-none focus:ring-0'
      />
    </div>
  )
}

// File Display Component
function FileDisplay({ url, fileName }: { url?: string; fileName?: string }) {
  if (!url && !fileName) return null

  const isImage = (url || fileName)?.match(/\.(jpg|jpeg|png|gif|webp)$/i)
  const fileUrl = url || fileName

  return (
    <div className='mt-4 p-4 border rounded-lg bg-gray-50'>
      <div className='flex items-center gap-2 mb-2'>
        <FileText className='w-4 h-4 text-gray-500' />
        <span className='text-sm font-medium'>File đính kèm</span>
      </div>
      
      {isImage ? (
        <div className='space-y-2'>
          <img 
            src={fileUrl} 
            alt='File preview' 
            className='max-h-64 w-full object-cover rounded border'
          />
          <div className='flex items-center gap-2'>
            <a 
              href={fileUrl} 
              download 
              className='flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800'
            >
              <Download className='w-3 h-3' />
              Tải xuống
            </a>
          </div>
        </div>
      ) : (
        <div className='flex items-center justify-between p-2 bg-white rounded border'>
          <div className='flex items-center gap-2'>
            <Paperclip className='w-4 h-4 text-gray-500' />
            <span className='text-sm'>{fileName || 'File đính kèm'}</span>
          </div>
          <a 
            href={fileUrl} 
            download 
            className='flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800'
          >
            <Download className='w-3 h-3' />
            Tải xuống
          </a>
        </div>
      )}
    </div>
  )
}

// Ban User Dialog Component
function BanUserDialog({ question, children }: { question: any; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')

  const handleBan = () => {
    // Implement ban user logic
    toast.success('Đã cấm người dùng')
    setOpen(false)
    setReason('')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cấm người dùng</DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          <div>
            <p className='text-sm text-gray-600 mb-2'>
              Bạn có chắc chắn muốn cấm người dùng <strong>{question?.askerFullName}</strong>?
            </p>
            <Textarea
              placeholder='Nhập lý do cấm...'
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <div className='flex justify-end gap-2'>
            <Button variant='outline' onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button variant='destructive' onClick={handleBan} disabled={!reason.trim()}>
              Cấm người dùng
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Delete Question Dialog Component
function DeleteQuestionDialog({ questionId, children }: { questionId: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const navigate = useNavigate()

  const deleteMutation = useMutation({
    mutationFn: (_params: { id: string; reason: string }) => {
      // Implement delete question API call
      return Promise.resolve({ data: { message: 'Xóa câu hỏi thành công' } })
    }
  })

  const handleDelete = () => {
    deleteMutation.mutate(
      { id: questionId, reason },
      {
        onSuccess: () => {
          toast.success('Đã xóa câu hỏi')
          setOpen(false)
          navigate(path.manageQuestion)
        }
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xóa câu hỏi</DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          <div>
            <p className='text-sm text-gray-600 mb-2'>
              Bạn có chắc chắn muốn xóa câu hỏi này?
            </p>
            <Textarea
              placeholder='Nhập lý do xóa...'
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <div className='flex justify-end gap-2'>
            <Button variant='outline' onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button 
              variant='destructive' 
              onClick={handleDelete} 
              disabled={!reason.trim() || deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Đang xóa...' : 'Xóa câu hỏi'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Forward Question Dialog Component
function ForwardQuestionDialog({ questionId, children }: { questionId: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [note, setNote] = useState('')
  const navigate = useNavigate()

  // Lấy danh sách departments
  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: getAllDepartments
  })

  const queryClient = useQueryClient()
  
  // Mutation để chuyển tiếp câu hỏi
  const forwardQuestionMutation = useMutation({
    mutationFn: (body: { toDepartmentId: string; questionId: string; note?: string }) =>
      forwardQuestion({
        ...body,
        consultantId: 0 // Backend không cần consultantId, chỉ cần để thỏa mãn type
      })
  })

  const handleForward = () => {
    if (!selectedDepartment) {
      toast.error('Vui lòng chọn khoa chuyển đến')
      return
    }


    forwardQuestionMutation.mutate(
      {
        toDepartmentId: selectedDepartment, // Giữ nguyên string ObjectId
        questionId: questionId,
        note: note || undefined
      },
             {
                   onSuccess: (res) => {
            toast.success(res.data.message || 'Đã chuyển tiếp câu hỏi thành công')
            setOpen(false)
            setSelectedDepartment('')
            setNote('')
            
            // Invalidate tất cả queries liên quan đến questions
            queryClient.invalidateQueries({ queryKey: ['questions'] })
            queryClient.invalidateQueries({ queryKey: ['question'] })
            
            // Chuyển về trang danh sách câu hỏi nhanh hơn
            setTimeout(() => {
              navigate('/manage/questions')
            }, 500)
          },
        onError: (error: any) => {
          console.error('❌ Forward error:', error)
          console.error('❌ Error response:', error.response?.data)
          toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi chuyển tiếp câu hỏi')
        }
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chuyển tiếp câu hỏi</DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          <div>
            <label className='text-sm font-medium'>Chọn khoa chuyển đến</label>
            <select 
              value={selectedDepartment} 
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className='w-full p-2 border rounded-md mt-1'
              disabled={forwardQuestionMutation.isPending}
            >
              <option value=''>Chọn khoa</option>
              {departments?.data.data?.map((dept: any) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className='text-sm font-medium'>Ghi chú</label>
            <Textarea
              placeholder='Nhập ghi chú...'
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={forwardQuestionMutation.isPending}
              className='mt-1'
            />
          </div>
          <div className='flex justify-end gap-2'>
            <Button 
              variant='outline' 
              onClick={() => setOpen(false)}
              disabled={forwardQuestionMutation.isPending}
            >
              Hủy
            </Button>
            <Button 
              onClick={handleForward} 
              disabled={!selectedDepartment || forwardQuestionMutation.isPending}
            >
              {forwardQuestionMutation.isPending ? 'Đang chuyển tiếp...' : 'Chuyển tiếp'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Convert to Common Question Dialog Component
function ConvertToCommonQuestionDialog({ question, children }: { question: any; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  const handleConvert = () => {
    // Implement convert to common question logic
    toast.success('Đã chuyển thành câu hỏi chung')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chuyển thành câu hỏi chung</DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          <p className='text-sm text-gray-600'>
            Bạn có chắc chắn muốn chuyển câu hỏi này thành câu hỏi chung?
          </p>
          <div className='flex justify-end gap-2'>
            <Button variant='outline' onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleConvert}>
              Chuyển đổi
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Update Answer Dialog Component
function UpdateAnswerDialog({ question, refetch, children }: { question: any; refetch: any; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState(question?.answerContent || '')

  const handleUpdate = () => {
    // Implement update answer logic
    toast.success('Đã cập nhật câu trả lời')
    setOpen(false)
    refetch()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Chỉnh sửa câu trả lời</DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          <div>
            <label className='text-sm font-medium'>Nội dung câu trả lời</label>
            <SimpleEditor
              value={content}
              onChange={setContent}
              placeholder='Nhập nội dung câu trả lời...'
            />
          </div>
          <div className='flex justify-end gap-2'>
            <Button variant='outline' onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleUpdate}>
              Cập nhật
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Delete Answer Dialog Component
function DeleteAnswerDialog({ question, refetch, children }: { question: any; refetch: any; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  const handleDelete = () => {
    // Implement delete answer logic
    toast.success('Đã xóa câu trả lời')
    setOpen(false)
    refetch()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xóa câu trả lời</DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          <p className='text-sm text-gray-600'>
            Bạn có chắc chắn muốn xóa câu trả lời này?
          </p>
          <div className='flex justify-end gap-2'>
            <Button variant='outline' onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button variant='destructive' onClick={handleDelete}>
              Xóa
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function QuestionDetail() {
  const { user, role } = useContext(AppContext)
  const { id } = useParams()
  const { status } = useQueryParams()
  const isApproval = status === 'APPROVAL'
  const navigate = useNavigate()

  const [showToAnswer, setShowToAnswer] = useState<boolean>(false)
  const [file, setFile] = useState<File>()
  // const [questionPlainText, setQuestionPlainText] = useState<string>('')

  const { data: questionResponse, refetch } = useQuery({
    queryKey: ['question', id],
    queryFn: () => getQuestionById(id as string),
    enabled: !!id
  })
  const question = questionResponse?.data.data

  // Trích xuất plain text khi câu hỏi được tải
  // useEffect(() => {
  //   if (question?.content) {
  //     const plainText = question.content.replace(/<[^>]+>/g, '').trim()
  //     setQuestionPlainText(plainText)
  //   }
  // }, [question])

  const previewImage = useMemo(() => {
    return file ? URL.createObjectURL(file) : isApproval ? question?.fileUrl : ''
  }, [file, question])

  const answerMutation = useMutation({
    mutationFn: ({ params, file }: { params: Answer; file: File }) => answerTheQuestion(params, file)
  })

  const approvalAnswerMutation = useMutation({
    mutationFn: ({ questionId, content, file }: { questionId: string; content: string; file: File }) =>
      approvalAnswer(questionId, content, file)
  })

  const { data: deleteLog } = useQuery({
    queryKey: ['deletion-log', id],
    queryFn: () => getDeleteLog(id as string),
    enabled: !!id
  })

  const form = useForm({
    defaultValues: {
      content: isApproval ? question?.answerContent : ''
    }
  })

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileFromLocal = event.target.files?.[0]
    setFile(fileFromLocal)
  }

  const handleOpenToAnswer = () => {
    setShowToAnswer(true)
  }

  const onSubmit = form.handleSubmit((values) => {
    if (!isApproval) {
      values.content = `<div class="editor">${values.content}</div>`
      const params = {
        questionId: question?.id || '0',
        content: values.content,
        title: 'answer',
        statusApproval: false
      } as any
      answerMutation.mutate(
        { params, file: file as File },
        {
          onSuccess: (res) => {
            toast.success(res.data.message)
            navigate(path.manageQuestion)
          }
        }
      )
      return
    }
    const payload = {
      questionId: String(question?.id),
      content: values.content as string,
      file: file as File
    }
    approvalAnswerMutation.mutate(payload, {
      onSuccess: (res) => {
        toast.success(res.data.message)
        navigate(path.manageApprovalAnswer)
      }
    })
  })

  const onSubmitWithStatus = () => {
    form.handleSubmit((values) => {
      if (!question || !values.content) return
      values.content = `<div class="editor">${values.content}</div>`
      const params = {
        questionId: question?.id || '0',
        content: values.content,
        title: 'answer',
        statusApproval: true
      } as any
      answerMutation.mutate(
        { params, file: file as File },
        {
          onSuccess: (res) => {
            toast.success(res.data.message)
            navigate(path.manageQuestion)
          }
        }
      )
    })()
  }

  useEffect(() => {
    if (!isApproval) return
    if (!form.watch('content') && question) {
      form.setValue('content', question.answerContent)
    }
  }, [question, isApproval])

  useEffect(() => {
    if (showToAnswer) {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [showToAnswer])

  if (!question) {
    return (
      <div className='flex items-center justify-center py-12'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-2 text-gray-600'>Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='max-w-4xl mx-auto space-y-6'>
      {/* Question Header */}
      <div className='bg-white rounded-lg shadow-sm border p-6'>
        <h1 className='text-2xl font-bold text-gray-900 mb-4 break-words'>{question.title}</h1>
        
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center space-x-3'>
            <Avatar className='h-10 w-10'>
              <AvatarImage src={question.askerAvatarUrl} />
              <AvatarFallback>
                <User className='h-5 w-5' />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className='font-semibold text-sm'>
                {question.askerFullName}
              </p>
              <p className='text-xs text-gray-500'>{question.user?.studentCode || 'N/A'}</p>
            </div>
            <div className='flex items-center gap-1 text-sm text-gray-500'>
              <Calendar className='h-4 w-4' />
              {formatDate(question.createdAt)}
            </div>
          </div>
          
          <div className='flex items-center space-x-2'>
            <Button
              variant='ghost'
              size='sm'
              onClick={handleOpenToAnswer}
              className='flex items-center gap-2'
            >
              <ReplyIcon className='h-4 w-4' />
              {isApproval ? 'Đánh giá' : 'Phản hồi'}
            </Button>
            <BanUserDialog question={question}>
              <Button variant='destructive' size='sm'>
                <BanIcon className='h-4 w-4' />
              </Button>
            </BanUserDialog>
          </div>
        </div>

        {/* Department and Field */}
        <div className='flex items-center gap-2 mb-4'>
          <Badge variant='outline' className='flex items-center gap-1'>
            <Building2 className='h-3 w-3' />
            {question.department?.name}
            {question.originalDepartment && (
              <span className='text-xs text-gray-500 ml-1'>
                (chuyển từ {question.originalDepartment.name})
              </span>
            )}
          </Badge>
          <Badge variant='secondary' className='flex items-center gap-1'>
            <Tag className='h-3 w-3' />
            {question.field?.name}
          </Badge>
        </div>
      </div>

      {/* Delete Log Alert */}
      {deleteLog?.data?.data?.reason != null && (
        <div className='bg-red-100 text-red-700 px-6 py-4 shadow-lg rounded-lg flex items-start gap-2'>
          <AlertTriangleIcon className='w-5 h-5 text-red-700 mt-1' />
          <div>
            <div className='font-semibold'>Lý do bị xóa: {deleteLog.data.data.reason}</div>
            <div className='text-sm text-red-600 mt-1'>
              <span><strong>Người xóa:</strong> {deleteLog.data.data.deletedBy}</span>
              <span className='ml-4'>
                <strong>Thời gian xóa:</strong> {new Date(deleteLog.data.data.deletedAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Forward Question Info */}
      {question?.forwardQuestionDTO && (
        <div className='bg-blue-100 text-blue-700 px-6 py-4 shadow-lg rounded-lg flex items-start gap-2'>
          <MessageSquare className='h-5 w-5 text-blue-700 mt-1' />
          <div>
            <div className='font-semibold'>{question?.forwardQuestionDTO.title}</div>
            <div className='text-sm mt-2 space-y-1'>
              <div><strong>Chuyển từ:</strong> {question?.forwardQuestionDTO.fromDepartment.name}</div>
              <div><strong>Chuyển đến:</strong> {question?.forwardQuestionDTO.toDepartment.name}</div>
              <div><strong>Tư vấn viên thực hiện:</strong> {question?.forwardQuestionDTO.consultant.name}</div>
              <div><strong>Thời gian chuyển tiếp:</strong> {question?.forwardQuestionDTO.createdAt}</div>
            </div>
          </div>
        </div>
      )}

      {/* Question Content */}
      <div className='bg-white rounded-lg shadow-sm border p-6'>
        <div className='prose prose-sm max-w-none'>
          <div dangerouslySetInnerHTML={{ __html: question.content }} />
        </div>
        <FileDisplay url={question.fileUrl} fileName={question.fileUrl} />
      </div>

      {/* Answer Section */}
      {question && question.answers && question.answers.length > 0 && (
        <div className='space-y-4'>
          <h2 className='text-lg font-semibold text-gray-900'>Câu trả lời ({question.answers.length})</h2>
          {question.answers.map((answer) => (
            <div key={answer.id} className='bg-white rounded-lg shadow-sm border p-6'>
              <div className='flex items-start space-x-3'>
                <Avatar className='h-8 w-8'>
                  <AvatarImage src={answer.user?.avatarUrl} />
                  <AvatarFallback>
                    <User className='h-4 w-4' />
                  </AvatarFallback>
                </Avatar>
                <div className='flex-1'>
                  <div className='flex items-center justify-between mb-2'>
                    <div>
                      <div className='font-semibold text-sm'>
                        {answer.user?.fullName || answer.user?.username}
                      </div>
                      <div className='text-xs text-gray-500'>
                        {formatDate(answer.createdAt)}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' size='sm'>
                          <EllipsisIcon className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <UpdateAnswerDialog question={question} refetch={refetch}>
                          <DropdownMenuItem>Chỉnh sửa</DropdownMenuItem>
                        </UpdateAnswerDialog>
                        <DeleteAnswerDialog question={question} refetch={refetch}>
                          <DropdownMenuItem className='text-red-600'>Xóa</DropdownMenuItem>
                        </DeleteAnswerDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className='prose prose-sm max-w-none'>
                    <div dangerouslySetInnerHTML={{ __html: answer.content }} />
                  </div>
                  {answer.file && <FileDisplay url={answer.file} fileName={answer.file} />}
                  {!answer.statusApproval && (
                    <Badge variant='secondary' className='mt-2'>
                      Chờ duyệt
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      {!showToAnswer && (
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-2'>
            <Button onClick={handleOpenToAnswer}>
              {isApproval ? 'Đánh giá' : 'Phản hồi'}
            </Button>
            {!isApproval && (
              <ForwardQuestionDialog questionId={question?.id || ''}>
                <Button variant='outline'>
                  <Forward className='h-4 w-4 mr-2' />
                  Chuyển tiếp
                </Button>
              </ForwardQuestionDialog>
            )}
            {[ROLE.admin as Role, ROLE.advisor as Role].includes(role as Role) && (
              <ConvertToCommonQuestionDialog question={question}>
                <Button variant='secondary'>
                  <RotateCcw className='h-4 w-4 mr-2' />
                  Chuyển thành câu hỏi chung
                </Button>
              </ConvertToCommonQuestionDialog>
            )}
          </div>
          <DeleteQuestionDialog questionId={id as string}>
            <Button variant='destructive'>
              <Trash2 className='h-4 w-4 mr-2' />
              Xóa câu hỏi
            </Button>
          </DeleteQuestionDialog>
        </div>
      )}

      {/* Answer Form */}
      {showToAnswer && (
        <div className='bg-white rounded-lg shadow-sm border p-6'>
          <div className='flex items-start space-x-3'>
            <Avatar className='h-8 w-8'>
              <AvatarImage src={user?.avatarUrl} />
              <AvatarFallback>
                <User className='h-4 w-4' />
              </AvatarFallback>
            </Avatar>
            <div className='flex-1'>
              <Form {...form}>
                <form onSubmit={onSubmit} className='space-y-4'>
                  <FormField
                    control={form.control}
                    name='content'
                    render={({ field }) => (
                      <FormItem>
                        <label className='text-sm font-medium'>Nội dung trả lời</label>
                        <FormControl>
                          <SimpleEditor
                            value={field.value || ''}
                            onChange={field.onChange}
                            placeholder='Nhập nội dung trả lời...'
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <div className='space-y-2'>
                    <label className='flex items-center gap-2 text-sm font-medium'>
                      <Paperclip className='w-4 h-4' />
                      Tệp đính kèm
                    </label>
                    <Input
                      type='file'
                      onChange={handleFileChange}
                      accept='.doc,.docx,.pdf,image/*'
                      className='cursor-pointer'
                    />
                    {previewImage && <FileDisplay url={previewImage} />}
                  </div>
                  
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-2'>
                      <Button
                        type='submit'
                        disabled={answerMutation.isPending || approvalAnswerMutation.isPending}
                      >
                        {answerMutation.isPending || approvalAnswerMutation.isPending ? (
                          <>
                            <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                            Đang gửi...
                          </>
                        ) : (
                          <>
                            <Send className='h-4 w-4 mr-2' />
                            {!isApproval ? 'Gửi' : 'Phê duyệt'}
                          </>
                        )}
                      </Button>
                      {!isApproval && (
                        <Button
                          type='button'
                          variant='secondary'
                          disabled={answerMutation.isPending}
                          onClick={onSubmitWithStatus}
                        >
                          <MessageSquare className='h-4 w-4 mr-2' />
                          Preview
                        </Button>
                      )}
                    </div>
                    <Button
                      type='button'
                      variant='ghost'
                      onClick={() => setShowToAnswer(false)}
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
