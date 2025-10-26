import { deleteAnswer } from '@/apis/question.api'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Question } from '@/types/question.type'
import { useMutation } from '@tanstack/react-query'
import React, { useState } from 'react'
import { Trash2 } from 'lucide-react'

interface Props {
  readonly children: React.ReactNode
  readonly question: Question
  readonly refetch: any
}
export default function DialogDeleteAnswer({ children, question, refetch }: Props) {
  const [open, setOpen] = useState<boolean>(false)

  const deleteAnswerMutation = useMutation({
    mutationFn: (id: number) => deleteAnswer(id)
  })

  const handleDelete = () => {
    const id = question.answerId
    if (!id) {
      toast.error('Không tìm thấy câu trả lời')
      return
    }
    
    deleteAnswerMutation.mutate(id, {
      onSuccess: (res) => {
        toast.success(res.data.message)
        setOpen(false)
        refetch()
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Trash2 className='w-5 h-5 text-red-500' />
            Xóa câu trả lời
          </DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          <div>
            <p className='text-sm text-gray-600 mb-2'>
              Bạn có chắc chắn muốn xóa câu trả lời này?
            </p>
            <p className='text-xs text-gray-500'>
              Hành động này không thể hoàn tác và câu trả lời sẽ bị xóa vĩnh viễn.
            </p>
          </div>
          
          <div className='flex justify-end gap-2'>
            <Button 
              variant='outline' 
              onClick={() => setOpen(false)}
              disabled={deleteAnswerMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              variant='destructive'
              disabled={deleteAnswerMutation.isPending}
              onClick={handleDelete}
            >
              {deleteAnswerMutation.isPending ? 'Đang xóa...' : 'Xóa câu trả lời'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
