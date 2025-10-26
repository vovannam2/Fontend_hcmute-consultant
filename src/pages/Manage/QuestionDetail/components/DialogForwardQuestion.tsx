import { getConsultantsByDepartment } from '@/apis/consultant.api'
import { getAllDepartments } from '@/apis/department.api'
import { forwardQuestion } from '@/apis/question.api'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import path from '@/constants/path'
import { toast } from 'sonner'
import { Consultant } from '@/types/consultant.type'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

interface Props {
  readonly questionId: string
}

interface FormData {
  departmentId: string
  consultantId: string
  note: string
}

export default function DialogForwardQuestion({ questionId }: Props) {
  const [open, setOpen] = useState(false)
  const form = useForm<FormData>({
    defaultValues: {
      departmentId: '',
      consultantId: '',
      note: ''
    }
  })

  const navigate = useNavigate()

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: getAllDepartments
  })

  const departmentId = form.watch('departmentId')
  const { data: consultants } = useQuery({
    queryKey: ['teacher-consultants', departmentId],
    queryFn: () => getConsultantsByDepartment(departmentId),
    enabled: !!departmentId
  })

  const forwardQuestionMutation = useMutation({
    mutationFn: (body: { toDepartmentId: string; questionId: string; consultantId: number; note?: string }) => forwardQuestion(body)
  })

  const onSubmit = form.handleSubmit((values) => {
    if (!values.departmentId || !values.consultantId) {
      toast.error('Vui lòng chọn khoa và tư vấn viên')
      return
    }

    const body = {
      toDepartmentId: values.departmentId, // Giữ nguyên string ObjectId
      consultantId: parseInt(values.consultantId),
      questionId,
      note: values.note
    }
    forwardQuestionMutation.mutate(body, {
      onSuccess: (res) => {
        toast.success(res.data.message)
        setOpen(false)
        form.reset()
        navigate(path.manageQuestion)
      }
    })
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline'>Chuyển tiếp</Button>
      </DialogTrigger>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Chuyển tiếp câu hỏi</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className='space-y-4'>
            <FormField
              control={form.control}
              name='departmentId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chọn khoa</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Chọn khoa' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {departments?.data.data?.map((dept: any) => (
                        <SelectItem key={dept.id} value={String(dept.id)}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='consultantId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chọn tư vấn viên</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={!departmentId}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Chọn tư vấn viên' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {consultants?.data.data?.map((consultant: Consultant) => (
                        <SelectItem key={consultant.id} value={String(consultant.id)}>
                          {consultant.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='note'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ghi chú (tùy chọn)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Nhập ghi chú...'
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className='flex justify-end gap-2'>
              <Button type='button' variant='outline' onClick={() => setOpen(false)}>
                Hủy
              </Button>
              <Button
                type='submit'
                disabled={forwardQuestionMutation.isPending || !departmentId || !form.watch('consultantId')}
              >
                {forwardQuestionMutation.isPending ? 'Đang chuyển...' : 'Chuyển tiếp'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
