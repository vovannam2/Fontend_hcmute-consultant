import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Question as QuestionType } from '@/types/question.type'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'
import { MessageSquare, User, Calendar, Building2, Tag, Paperclip, Send } from 'lucide-react'
import { answerTheQuestion } from '@/apis/question.api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
// import { toast } from '@/hooks/useCustomToast'

interface Props {
  readonly question: QuestionType
}

// Question Display Component
function QuestionDisplay({ question }: { question: QuestionType }) {
  return (
    <div className='bg-gray-50 rounded-lg p-4 space-y-4'>
      <div className='flex items-start justify-between'>
        <div className='flex items-center space-x-3'>
          <Avatar className='h-10 w-10'>
            <AvatarImage src={question.askerAvatarUrl} />
            <AvatarFallback>
              <User className='h-5 w-5' />
            </AvatarFallback>
          </Avatar>
          <div>
            <p className='font-medium text-sm'>
              {question.askerFullName}
            </p>
            <p className='text-xs text-gray-500'>{question.user.studentCode}</p>
          </div>
        </div>
        <div className='text-right text-xs text-gray-500'>
          <div className='flex items-center gap-1'>
            <Calendar className='h-3 w-3' />
            {format(new Date(question.createdAt), 'dd/MM/yyyy HH:mm')}
          </div>
        </div>
      </div>

      <div className='space-y-2'>
        <div className='flex items-center gap-2'>
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
        
        <h3 className='font-semibold text-lg'>{question.title}</h3>
        
        <div className='prose prose-sm max-w-none'>
          <div dangerouslySetInnerHTML={{ __html: question.content }} />
        </div>
      </div>
    </div>
  )
}

// Simple Rich Text Editor Component
function SimpleEditor({ 
  value, 
  onChange, 
  placeholder = "Nhập nội dung trả lời..." 
}: { 
  value: string; 
  onChange: (value: string) => void; 
  placeholder?: string;
}) {
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)

  const handleFormat = (format: 'bold' | 'italic') => {
    const textarea = document.getElementById('answer-content') as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    
    let newText = ''
    if (format === 'bold') {
      newText = `<strong>${selectedText}</strong>`
      setIsBold(!isBold)
    } else if (format === 'italic') {
      newText = `<em>${selectedText}</em>`
      setIsItalic(!isItalic)
    }
    
    const newValue = value.substring(0, start) + newText + value.substring(end)
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
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className='min-h-[200px] border-0 resize-none focus:ring-0'
      />
    </div>
  )
}

export default function DialogAnswerQuestion({ question }: Props) {
  const [open, setOpen] = useState<boolean>(false)
  const [file, setFile] = useState<File>()
  const queryClient = useQueryClient()
  
  const previewImage = useMemo(() => {
    return file ? URL.createObjectURL(file) : ''
  }, [file])

  const form = useForm({
    defaultValues: {
      content: '',
      title: ''
    }
  })

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileFromLocal = event.target.files?.[0]
    setFile(fileFromLocal)
  }

  const answerMutation = useMutation({
    mutationFn: async (data: { content: string; title: string; file?: File }) => {
      
      const answerData = {
        questionId: question.id,
        content: data.content,
        title: data.title || `Trả lời cho: ${question.title}`,
        statusApproval: false
      } as any
      
      
      return answerTheQuestion(answerData, file)
    },
    onSuccess: () => {
      alert('Trả lời câu hỏi thành công!')
      form.reset()
      setFile(undefined)
      setOpen(false)
      queryClient.invalidateQueries({ queryKey: ['questions'] })
    },
    onError: (error: any) => {
      alert(error.message || 'Có lỗi xảy ra khi gửi trả lời!')
    }
  })

  const onSubmit = form.handleSubmit(async (values) => {
    answerMutation.mutate({
      content: values.content,
      title: values.title,
      file: file
    })
  })

  const handleRemoveFile = () => {
    setFile(undefined)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='ghost' size='sm' className='w-full justify-start'>
          <MessageSquare className='w-4 h-4 mr-2' />
          Trả lời câu hỏi
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <MessageSquare className='w-5 h-5' />
            Trả lời câu hỏi
          </DialogTitle>
        </DialogHeader>
        
        <div className='space-y-6'>
          {/* Question Display */}
          <QuestionDisplay question={question} />
          
          {/* Answer Form */}
          <Form {...form}>
            <form onSubmit={onSubmit} className='space-y-4'>
              <FormField
                control={form.control}
                name='title'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tiêu đề trả lời</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Nhập tiêu đề trả lời...'
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name='content'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nội dung trả lời</FormLabel>
                    <FormControl>
                      <SimpleEditor
                        value={field.value}
                        onChange={field.onChange}
                        placeholder='Nhập nội dung trả lời chi tiết...'
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {/* File Upload */}
              <div className='space-y-2'>
                <FormLabel className='flex items-center gap-2'>
                  <Paperclip className='w-4 h-4' />
                  Tệp đính kèm (tùy chọn)
                </FormLabel>
                <div className='space-y-2'>
                  <Input
                    id='file'
                    type='file'
                    onChange={handleFileChange}
                    accept='image/*,.pdf,.doc,.docx'
                    className='cursor-pointer'
                  />
                  
                  {/* File Preview */}
                  {file && (
                    <div className='relative'>
                      <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                        <div className='flex items-center gap-2'>
                          <Paperclip className='w-4 h-4 text-gray-500' />
                          <span className='text-sm text-gray-700'>{file.name}</span>
                          <span className='text-xs text-gray-500'>
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          onClick={handleRemoveFile}
                          className='text-red-500 hover:text-red-700'
                        >
                          ✕
                        </Button>
                      </div>
                      
                      {/* Image Preview */}
                      {file.type.startsWith('image/') && previewImage && (
                        <div className='mt-2'>
                          <img 
                            src={previewImage} 
                            alt='Preview' 
                            className='max-h-64 w-full object-cover rounded-lg border'
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Submit Button */}
              <div className='flex justify-end gap-2 pt-4'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setOpen(false)}
                  disabled={answerMutation.isPending}
                >
                  Hủy
                </Button>
                <Button 
                  type='submit' 
                  disabled={answerMutation.isPending || !form.watch('content').trim()}
                  className='min-w-[120px]'
                >
                  {answerMutation.isPending ? (
                    <>
                      <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <Send className='w-4 h-4 mr-2' />
                      Gửi trả lời
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
