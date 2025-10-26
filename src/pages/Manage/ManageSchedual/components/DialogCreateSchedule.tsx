import { createSchedule } from '@/apis/consultant.api'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { ErrorResponse } from '@/types/utils.type'
import { CreateScheduleSchema } from '@/utils/rules'
import { isAxiosUnprocessableEntity } from '@/utils/utils'
import { yupResolver } from '@hookform/resolvers/yup'
import { CalendarIcon, Clock } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { format } from 'date-fns'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'

export type CreateScheduleFormData = yup.InferType<typeof CreateScheduleSchema>

interface Props {
  readonly children: React.ReactNode
}

export default function DialogCreateSchedule({ children }: Props) {
  const form = useForm<CreateScheduleFormData>({
    defaultValues: {
      title: '',
      content: '',
      location: '',
      link: '',
      mode: false,
      statusPublic: true,
      consultationDate: '',
      consultationTime: '',
      type: false
    },
    resolver: yupResolver(CreateScheduleSchema)
  })

  const [isOnline, setIsOnline] = useState<boolean>(false)
  const [open, setOpen] = useState<boolean>(false)
  const [date, setDate] = useState<Date | undefined>(() => {
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    return date
  })
  const [time, setTime] = useState<string>('')

  const handleCheckedChange = (val: boolean) => {
    form.setValue('mode', val)
    setIsOnline(val)
  }

  const createScheduleMutation = useMutation({
    mutationFn: (body: CreateScheduleFormData) => createSchedule(body)
  })

  const onSubmit = form.handleSubmit((values) => {
    values.consultationDate = format(String(date), 'yyyy-MM-dd')
    values.consultationTime = time
    createScheduleMutation.mutate(values, {
      onSuccess: (res) => {
        toast.success(res.data.message)
        setOpen(false)
        form.reset()
        setDate(new Date())
        setTime('')
      },
      onError: (error) => {
        if (isAxiosUnprocessableEntity<ErrorResponse<{ field: string; message: string }[]>>(error)) {
          const formError = error.response?.data.data
          formError?.forEach(({ field, message }) => {
            form.setError(field as keyof CreateScheduleFormData, {
              message: message,
              type: 'server'
            })
          })
        }
      }
    })
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent className='max-w-[800px] max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Tạo buổi tư vấn</DialogTitle>
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
                      <Input placeholder='Nhập tiêu đề' {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='content'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nội dung</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder='Nhập nội dung...' 
                        className='min-h-[200px]'
                        {...field} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className='flex items-center space-x-2 my-2'>
                <Switch id='mode' checked={isOnline} onCheckedChange={(val) => handleCheckedChange(val)} />
                <FormLabel htmlFor='mode'>{isOnline ? 'Online' : 'Offline'}</FormLabel>
              </div>
              <div>
                <FormLabel>Ngày tư vấn</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !date && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className='mr-2 h-4 w-4' />
                      {date ? format(date, 'dd/MM/yyyy') : <span>Chọn ngày</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0' align='start'>
                    <Calendar
                      mode='single'
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <FormLabel>Giờ tư vấn (24h)</FormLabel>
                <div className='relative'>
                  <Clock className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                  <Input
                    type='text'
                    className='pl-8'
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder='HH:MM (ví dụ: 14:30)'
                    pattern='^([01][0-9]|2[0-3]):[0-5][0-9]$'
                  />
                  <p className='text-xs text-muted-foreground mt-1'>Định dạng 24h: 00:00 - 23:59</p>
                </div>
              </div>
              {isOnline && (
                <FormField
                  control={form.control}
                  name='link'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link</FormLabel>
                      <FormControl>
                        <Input placeholder='Nhập link' {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
              {!isOnline && (
                <FormField
                  control={form.control}
                  name='location'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Địa chỉ</FormLabel>
                      <FormControl>
                        <Input placeholder='Nhập địa chỉ' {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
              <Button 
                disabled={createScheduleMutation.isPending}
                type='submit'
                className='w-full'
              >
                {createScheduleMutation.isPending ? 'Đang tạo...' : 'Tạo'}
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
