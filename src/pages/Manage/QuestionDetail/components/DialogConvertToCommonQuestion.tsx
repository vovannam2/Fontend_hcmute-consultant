import { convertToCommonQuestion } from '@/apis/question.api'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Question } from '@/types/question.type'
import { useMutation } from '@tanstack/react-query'
import React, { useState } from 'react'
import { RotateCcw } from 'lucide-react'

interface Props {
  readonly children: React.ReactNode
  readonly question?: Question
}

export default function DialogConvertToCommonQuestion({ children, question }: Props) {
  const [open, setOpen] = useState<boolean>(false)

  const convertToCommonQuestionMutation = useMutation({
    mutationFn: (questionId: string) => convertToCommonQuestion(questionId)
  })

  const handleConvert = () => {
    const questionId = question?.id
    if (!questionId) {
      toast.error('Không tìm thấy câu hỏi')
      return
    }
    convertToCommonQuestionMutation.mutate(questionId, {
      onSuccess: (res) => {
        toast.success(res.data.message)
        setOpen(false)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <RotateCcw className='w-5 h-5 text-blue-500' />
            Chuyển thành câu hỏi chung
          </DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          <div>
            <p className='text-sm text-gray-600 mb-2'>
              Bạn có chắc chắn muốn chuyển câu hỏi này thành câu hỏi chung?
            </p>
            <p className='text-xs text-gray-500'>
              Câu hỏi chung sẽ được hiển thị trong thư viện câu hỏi và có thể được tìm kiếm bởi tất cả người dùng.
            </p>
          </div>
          
          <div className='flex justify-end gap-2'>
            <Button 
              variant='outline' 
              onClick={() => setOpen(false)}
              disabled={convertToCommonQuestionMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              disabled={convertToCommonQuestionMutation.isPending}
              onClick={handleConvert}
            >
              {convertToCommonQuestionMutation.isPending ? 'Đang chuyển...' : 'Chuyển đổi'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
