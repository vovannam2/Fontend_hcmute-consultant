import { banUser } from '@/apis/user.api'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { toast } from 'sonner'
import { Question } from '@/types/question.type'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Ban } from 'lucide-react'

interface Props {
  readonly children: React.ReactNode
  readonly question?: Question
}

interface FormData {
  reason: string
}

export default function DialogBanUser({ children, question }: Props) {
  const [open, setOpen] = useState<boolean>(false)

  const form = useForm<FormData>({
    defaultValues: {
      reason: ''
    }
  })

  const banUserMutation = useMutation({
    mutationFn: ({ id }: { id: number }) => banUser(id)
  })

  const onSubmit = form.handleSubmit((values) => {
    if (!values.reason.trim()) {
      toast.error('Vui lòng nhập lý do cấm')
      return
    }

    const idUser = question?.askerId as number
    if (!idUser) {
      toast.error('Không tìm thấy thông tin người dùng')
      return
    }

    banUserMutation.mutate(
      { id: idUser },
      {
        onSuccess: (res) => {
          toast.success(res.data.message)
          setOpen(false)
          form.reset()
        }
      }
    )
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Ban className='w-5 h-5 text-red-500' />
            Cấm người dùng
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className='space-y-4'>
            <div>
              <p className='text-sm text-gray-600 mb-4'>
                Bạn có chắc chắn muốn cấm người dùng <strong>{question?.askerFullName}</strong>?
                Hành động này sẽ ngăn họ đặt câu hỏi mới.
              </p>
              <FormField
                control={form.control}
                name='reason'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lý do cấm *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Nhập lý do cấm người dùng...'
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
                disabled={banUserMutation.isPending}
              >
                Hủy
              </Button>
              <Button
                type='submit'
                variant='destructive'
                disabled={banUserMutation.isPending || !form.watch('reason').trim()}
              >
                {banUserMutation.isPending ? 'Đang cấm...' : 'Cấm người dùng'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
