import { updateAnswer } from '@/apis/question.api'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { MyAnswer, Question } from '@/types/question.type'
import { useMutation } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { FileText, Download, Paperclip } from 'lucide-react'

interface Props {
  readonly question?: Question
  readonly children: React.ReactNode
  readonly refetch: any
}

interface FormData {
  content: string
}

// Simple Rich Text Editor Component
function SimpleEditor({ 
  value, 
  onChange, 
  placeholder = "Nhập nội dung câu trả lời..." 
}: { 
  value: string | undefined; 
  onChange: (value: string) => void; 
  placeholder?: string;
}) {
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)

  const handleFormat = (format: 'bold' | 'italic') => {
    const textarea = document.getElementById('update-answer-content') as HTMLTextAreaElement
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
        id='update-answer-content'
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

export default function DialogUpdateAnswer({ question, children, refetch }: Props) {
  const form = useForm<FormData>({
    defaultValues: {
      content: question?.answerContent ?? ''
    }
  })

  const [open, setOpen] = useState<boolean>(false)
  const [file, setFile] = useState<File>()
  const previewImage = useMemo(() => {
    return file ? URL.createObjectURL(file) : question ? question?.answerFileUrl : ''
  }, [file, question])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileFromLocal = event.target.files?.[0]
    setFile(fileFromLocal)
  }

  const updateAnswerMutation = useMutation({
    mutationFn: ({ params, file }: { params: MyAnswer; file: File }) => updateAnswer(params, file)
  })

  const onSubmit = form.handleSubmit((values) => {
    const params: MyAnswer = {
      answerId: question?.answerId as number,
      title: 'ANSWER',
      content: values.content,
      statusApproval: false
    }
    updateAnswerMutation.mutate(
      { params, file: file as File },
      {
        onSuccess: () => {
          refetch()
          setOpen(false)
          form.reset()
        }
      }
    )
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='max-h-[80vh] overflow-y-auto max-w-[800px]'>
        <DialogHeader>
          <DialogTitle>Chỉnh sửa câu trả lời</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className='space-y-4' onSubmit={onSubmit}>
            <FormField
              control={form.control}
              name='content'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nội dung câu trả lời</FormLabel>
                  <FormControl>
                    <SimpleEditor
                      value={field.value}
                      onChange={field.onChange}
                      placeholder='Nhập nội dung câu trả lời...'
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <div className='space-y-2'>
              <FormLabel className='flex items-center gap-2'>
                <Paperclip className='w-4 h-4' />
                Tệp đính kèm
              </FormLabel>
              <Input 
                type='file' 
                onChange={handleFileChange} 
                accept='.doc,.docx,.pdf,image/*'
                className='cursor-pointer'
              />
              {previewImage && <FileDisplay url={previewImage} />}
            </div>
            
            <div className='flex justify-end gap-2'>
              <Button type='button' variant='outline' onClick={() => setOpen(false)}>
                Hủy
              </Button>
              <Button 
                type='submit'
                disabled={updateAnswerMutation.isPending}
              >
                {updateAnswerMutation.isPending ? 'Đang lưu...' : 'Lưu'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
