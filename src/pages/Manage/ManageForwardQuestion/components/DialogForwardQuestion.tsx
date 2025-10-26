import { getConsultantsByDepartment } from '@/apis/consultant.api'
import { getAllDepartments } from '@/apis/department.api'
import { updateForwardQuestion } from '@/apis/question.api'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import useForwardQuestionQueryConfig from '@/hooks/useForwardQuestionQueryConfig'
import { Consultant } from '@/types/consultant.type'
import { ForwardQuestion } from '@/types/question.type'
import { ForwardQuestionSchema } from '@/utils/rules'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'

export type ForwardQuestionFormData = yup.InferType<typeof ForwardQuestionSchema>

interface Props {
  readonly children: React.ReactNode
  readonly forwardQuestion: ForwardQuestion
}

export default function DialogForwardQuestion({ children, forwardQuestion }: Props) {
  const [open, setOpen] = useState<boolean>(false)
  const forwardQuestionQueryConfig = useForwardQuestionQueryConfig()
  const queryClient = useQueryClient()

  const form = useForm<ForwardQuestionFormData>({
    defaultValues: {
      consultantId: String(forwardQuestion.consultant.id),
      toDepartmentId: String(forwardQuestion.toDepartment.id),
      title: forwardQuestion.title,
      questionId: String(forwardQuestion.questionId)
    }
  })

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: getAllDepartments
  })

  const departmentId = form.watch('toDepartmentId')
  const { data: consultants } = useQuery({
    queryKey: ['consultantsByDepartment', departmentId],
    queryFn: () => getConsultantsByDepartment(departmentId),
    enabled: !!departmentId
  })

  const updateForwardQuestionMutation = useMutation({
    mutationFn: ({ body, forwardQuestionId }: { body: ForwardQuestionFormData; forwardQuestionId: number }) => {
      const forwardQuestionData: ForwardQuestion = {
        id: String(forwardQuestionId),
        title: body.title,
        fromDepartment: forwardQuestion.fromDepartment,
        toDepartment: departments?.data.data?.find(dept => String(dept.id) === body.toDepartmentId) || forwardQuestion.toDepartment,
        consultant: {
          id: body.consultantId,
          name: consultants?.data.data?.find(consultant => String(consultant.id) === body.consultantId)?.fullName || ''
        },
        statusForward: forwardQuestion.statusForward,
        createdBy: forwardQuestion.createdBy,
        createdAt: forwardQuestion.createdAt,
        questionId: body.questionId
      }
      return updateForwardQuestion(forwardQuestionData, forwardQuestionId)
    }
  })

  const onSubmit = form.handleSubmit((values) => {
    updateForwardQuestionMutation.mutate(
      {
        body: values,
        forwardQuestionId: Number(forwardQuestion.id)
      },
      {
        onSuccess: (res) => {
          toast.success(res.data.message)
          queryClient.invalidateQueries({
            queryKey: ['forward-questions', forwardQuestionQueryConfig]
          })
          setOpen(false)
        }
      }
    )
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chỉnh sửa câu hỏi chuyển tiếp</DialogTitle>
        </DialogHeader>
        <div>
          <Form {...form}>
            <form onSubmit={onSubmit} className='space-y-4'>
              <FormField
                control={form.control}
                name='title'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tiêu đề</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='toDepartmentId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phòng ban</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Chọn phòng ban' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className='max-h-[30vh]'>
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
                    <FormLabel>Tư vấn viên</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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
              <Button
                disabled={updateForwardQuestionMutation.isPending}
                type='submit'
                className='w-full mt-2'
              >
                {updateForwardQuestionMutation.isPending ? 'Đang lưu...' : 'Lưu'}
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
