import { deleteQuestionByConsultant } from '@/apis/question.api'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import path from '@/constants/path'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'

interface Props {
  readonly questionId: string
}

interface FormData {
  reason: string
}

export default function DialogDeleteQuestion({ questionId }: Props) {
  const [open, setOpen] = useState<boolean>(false)
  const navigate = useNavigate()

  const form = useForm<FormData>({
    defaultValues: {
      reason: ''
    }
  })

  const deleteQuestionMutation = useMutation({
    mutationFn: ({ questionId, reason }: { questionId: string; reason: string }) =>
      deleteQuestionByConsultant(questionId, reason)
  })

  const onSubmit = form.handleSubmit((values) => {
    if (!values.reason.trim()) {
      toast.error('Vui lòng nhập lý do xóa')
      return
    }
    
    deleteQuestionMutation.mutate(
      { questionId, reason: values.reason },
      {
        onSuccess: (res) => {
          toast.success(res.data.message)
          setOpen(false)
          form.reset()
          navigate(path.manageQuestion)
        }
      }
    )
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type='button' variant='destructive' className='flex items-center gap-2'>
          <Trash2 className='w-4 h-4' />
          Xóa câu hỏi
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Xóa câu hỏi</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className='space-y-4'>
            <div>
              <p className='text-sm text-gray-600 mb-4'>
                Bạn có chắc chắn muốn xóa câu hỏi này? Hành động này không thể hoàn tác.
              </p>
              <FormField
                control={form.control}
                name='reason'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lý do xóa *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Nhập lý do xóa câu hỏi...'
                        {...field}
                        className='min-h-[100px]'
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            <div className='flex justify-end gap-2'>
              <Button 
                type='button' 
                variant='outline' 
                onClick={() => setOpen(false)}
                disabled={deleteQuestionMutation.isPending}
              >
                Hủy
              </Button>
              <Button
                type='submit'
                variant='destructive'
                disabled={deleteQuestionMutation.isPending || !form.watch('reason').trim()}
              >
                {deleteQuestionMutation.isPending ? 'Đang xóa...' : 'Xóa câu hỏi'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
