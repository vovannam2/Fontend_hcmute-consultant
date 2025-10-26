import { confirmSchedual, getSchedualById } from '@/apis/consultant.api'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import path from '@/constants/path'
import { toast } from 'sonner'
import DialogDeleteSchedual from '@/pages/Manage/SchedualDetail/components/DialogDeleteSchedual'
import DialogListMemberJoin from '@/pages/Manage/SchedualDetail/components/DialogListMemberJoin'
import { SchedualConfirm } from '@/types/consultant.type'
import { SchedualConfirmSchema } from '@/utils/rules'
import { yupResolver } from '@hookform/resolvers/yup'
import { TrashIcon, CalendarIcon } from '@radix-ui/react-icons'
import { useMutation, useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { omitBy } from 'lodash'
import { Clock, MapPin, Globe, Users, ArrowLeft } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams, Link } from 'react-router-dom'
import * as yup from 'yup'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const statusPublicSelectionData = [
  { value: 'true', label: 'Công khai' },
  { value: 'false', label: 'Riêng tư' }
]

const modeSelectionData = [
  { value: 'true', label: 'Online' },
  { value: 'false', label: 'Offline' }
]

type FormData = yup.InferType<typeof SchedualConfirmSchema>

export const getBoolean = (value: string | undefined) => {
  if (value === 'true') return true
  if (value == 'false') return false
  return undefined
}

const getTextOfBoolean = (value: boolean) => {
  if (value === true) return 'true'
  if (value === false) return 'false'
  return ''
}

export default function SchedualDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const formReset = useRef<boolean>(false)
  const form = useForm<FormData>({
    defaultValues: {
      title: '',
      content: '',
      mode: 'true',
      statusPublic: 'true',
      link: '',
      location: ''
    },
    resolver: yupResolver(SchedualConfirmSchema)
  })

  const mode = getBoolean(form.watch('mode'))

  const [date, setDate] = useState<Date | undefined>(() => {
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    return date
  })
  const [time, setTime] = useState<string>('')

  const { data: schedualResponse } = useQuery({
    queryKey: ['schedule', id],
    queryFn: () => getSchedualById(id as string),
    enabled: !!id
  })
  const schedule = schedualResponse?.data.data

  const confirmSchedualMutation = useMutation({
    mutationFn: ({ body, scheduleId }: { body: SchedualConfirm; scheduleId: string }) =>
      confirmSchedual(scheduleId, body)
  })

  const onSubmit = form.handleSubmit((values) => {
    values.content = `<div class="editor">${values.content}</div>`
    const body: SchedualConfirm = omitBy(
      {
        title: values.title,
        content: values.content,
        consultationDate: format(String(date), 'yyyy-MM-dd'),
        consultationTime: time ?? '00:00',
        link: values.link ?? '',
        location: values.location ?? '',
        mode: getBoolean(values.mode),
        statusPublic: getBoolean(values.statusPublic)
      },
      (value) => value === ''
    ) as unknown as SchedualConfirm
    const isOnline = getBoolean(values.mode)
    if (isOnline) {
      delete body.location
    } else {
      delete body.link
    }
    const scheduleId = String(schedule?.id)
    confirmSchedualMutation.mutate(
      { body, scheduleId },
      {
        onSuccess: (res) => {
          toast.success(res.data.message)
          navigate(path.manageSchedule)
        }
      }
    )
  })

  // Helper function to strip HTML tags and get plain text
  const stripHtmlTags = (html: string) => {
    if (!html) return ''
    // Remove HTML tags
    let text = html.replace(/<[^>]*>/g, '')
    // Decode HTML entities
    text = text.replace(/&nbsp;/g, ' ')
    text = text.replace(/&amp;/g, '&')
    text = text.replace(/&lt;/g, '<')
    text = text.replace(/&gt;/g, '>')
    text = text.replace(/&quot;/g, '"')
    text = text.replace(/&#39;/g, "'")
    return text.trim()
  }

  useEffect(() => {
    if (!schedule) return
    const cleanContent = stripHtmlTags(schedule.content || '')
    form.reset({
      content: cleanContent,
      link: schedule.link ?? '',
      location: schedule.location ?? '',
      mode: getTextOfBoolean(schedule.mode),
      statusPublic: getTextOfBoolean(schedule.statusPublic),
      title: schedule.title
    })
    setDate(schedule.consultationDate as unknown as Date)
    setTime(schedule.consultationTime)
    formReset.current = true
  }, [schedule])

  const isReadOnly = false // Always allow editing

  return (
    <div className='space-y-6 pb-6'>
      {formReset.current && (
        <>
          {/* Back Button */}
          <Link to={path.manageSchedule}>
            <Button variant='ghost' className='mb-4'>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Quay lại
            </Button>
          </Link>

          {/* Header Section */}
          <Card className='border-l-4 border-l-primary shadow-lg'>
            <CardHeader className='pb-4'>
              <div className='flex items-start justify-between'>
                <div className='flex-1'>
                  <CardTitle className='text-2xl font-bold mb-4 text-foreground'>{schedule?.title}</CardTitle>
                  <div className='flex items-center gap-4 flex-wrap'>
                    <div className='flex items-center gap-2'>
                      <Avatar className='size-10 border-2 border-primary/20'>
                        <AvatarImage src={schedule?.userName} alt={schedule?.userName} />
                        <AvatarFallback className='bg-primary/10 text-primary font-semibold'>
                          {schedule?.userName?.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className='font-semibold text-sm'>{schedule?.userName}</p>
                        <p className='text-xs text-muted-foreground'>Người tạo</p>
                      </div>
                    </div>
                    <Separator orientation='vertical' className='h-12' />
                    <div className='flex items-center gap-2 text-sm'>
                      <div className='p-2 bg-primary/10 rounded-lg'>
                        <CalendarIcon className='h-5 w-5 text-primary' />
                      </div>
                      <div>
                        <p className='font-medium'>
                          {schedule?.consultationDate 
                            ? new Date(schedule.consultationDate).toLocaleDateString('vi-VN', { 
                                day: '2-digit', 
                                month: '2-digit', 
                                year: 'numeric' 
                              })
                            : schedule?.consultationDate
                          }
                        </p>
                        <p className='text-xs text-muted-foreground flex items-center gap-1'>
                          <Clock className='h-3 w-3' />
                          {schedule?.consultationTime}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  {!schedule?.type && (
                    <DialogListMemberJoin schedule={schedule}>
                      <Button variant='outline' size='icon' className='hover:bg-primary hover:text-primary-foreground transition-colors'>
                        <Users className='h-5 w-5' />
                      </Button>
                    </DialogListMemberJoin>
                  )}
                  <DialogDeleteSchedual schedual={schedule}>
                    <Button variant='destructive' size='icon' className='hover:bg-destructive/90 transition-colors'>
                      <TrashIcon className='h-5 w-5' />
                    </Button>
                  </DialogDeleteSchedual>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Content Section */}
          <Card className='shadow-lg'>
            <CardHeader>
              <CardTitle className='text-lg flex items-center gap-2'>
                <div className='p-2 bg-primary/10 rounded-lg'>
                  <MapPin className='h-5 w-5 text-primary' />
                </div>
                Nội dung tư vấn
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='bg-gradient-to-br from-primary/5 to-transparent p-6 rounded-lg border-2 border-primary/10'>
                <div 
                  className='prose prose-sm max-w-none [&>*]:text-foreground/80'
                  dangerouslySetInnerHTML={{ __html: schedule?.content as string }}
                ></div>
              </div>
            </CardContent>
          </Card>

          {/* Form Section */}
          <Card className='shadow-lg'>
            <CardHeader className='bg-gradient-to-r from-primary/10 to-transparent'>
              <CardTitle className='text-lg flex items-center gap-2'>
                <div className='p-2 bg-primary rounded-lg'>
                  <CalendarIcon className='h-5 w-5 text-primary-foreground' />
                </div>
                Xác nhận thông tin lịch tư vấn
              </CardTitle>
            </CardHeader>
            <CardContent className='pt-6'>
              <Form {...form}>
                <form onSubmit={onSubmit} className='space-y-6'>
                  {/* Configuration Badge */}
                  <div className='flex items-center gap-2 mb-4'>
                    <Badge variant='default' className='flex items-center gap-1'>
                      <Globe className='h-3 w-3' />
                      Cấu hình buổi tư vấn
                    </Badge>
                  </div>

                  {/* Configuration Grid */}
                  <div className='grid grid-cols-4 gap-4'>
                    <FormField
                      control={form.control}
                      name='statusPublic'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='flex items-center gap-2'>
                            <Users className='h-4 w-4' />
                            Quyền riêng tư
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value} disabled={isReadOnly}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder='Công khai/Riêng tư' />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {statusPublicSelectionData.map((item) => (
                                <SelectItem key={item.value} value={item.value}>
                                  {item.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='mode'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='flex items-center gap-2'>
                            <Globe className='h-4 w-4' />
                            Hình thức
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value} disabled={isReadOnly}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder='Online/Offline' />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {modeSelectionData.map((item) => (
                                <SelectItem key={item.value} value={item.value}>
                                  {item.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <div>
                      <FormLabel className='flex items-center gap-2 mb-2'>
                        <CalendarIcon className='h-4 w-4' />
                        Ngày tư vấn
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant='outline'
                            className={cn(
                              'w-full justify-start text-left font-normal',
                              !date && 'text-muted-foreground'
                            )}
                            disabled={isReadOnly}
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
                            disabled={isReadOnly}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <FormLabel className='flex items-center gap-2 mb-2'>
                        <Clock className='h-4 w-4' />
                        Giờ tư vấn
                      </FormLabel>
                      <div className='relative'>
                        <Clock className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                        <Input
                          type='text'
                          className='pl-9'
                          value={time}
                          onChange={(e) => setTime(e.target.value)}
                          disabled={isReadOnly}
                          placeholder='HH:MM'
                        />
                      </div>
                      <p className='text-xs text-muted-foreground mt-1'>Định dạng 24h: 00:00 - 23:59</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Details Section */}
                  <div className='space-y-4'>
                    {mode && (
                      <FormField
                        control={form.control}
                        name='link'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className='flex items-center gap-2'>
                              <Globe className='h-4 w-4' />
                              Link meet
                            </FormLabel>
                            <FormControl>
                              <Input placeholder='Nhập link phòng meet' {...field} readOnly={isReadOnly} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    )}
                    {!mode && (
                      <FormField
                        control={form.control}
                        name='location'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className='flex items-center gap-2'>
                              <MapPin className='h-4 w-4' />
                              Địa chỉ
                            </FormLabel>
                            <FormControl>
                              <Input placeholder='Nhập địa chỉ tổ chức' {...field} readOnly={isReadOnly} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    )}
                    <FormField
                      control={form.control}
                      name='title'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tiêu đề</FormLabel>
                          <FormControl>
                            <Input placeholder='Nhập tiêu đề buổi tư vấn' {...field} readOnly={isReadOnly} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='content'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nội dung chi tiết</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder='Nhập nội dung chi tiết...'
                              className='min-h-[200px]'
                              {...field}
                              disabled={isReadOnly}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {!isReadOnly && (
                    <div className='flex gap-3 pt-4'>
                      <Button
                        type='submit'
                        disabled={confirmSchedualMutation.isPending}
                        className='flex-1 h-11 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200'
                      >
                        {confirmSchedualMutation.isPending ? (
                          <>
                            <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                            Đang xác nhận...
                          </>
                        ) : (
                          'Xác nhận lịch tư vấn'
                        )}
                      </Button>
                      <Link to={path.manageSchedule}>
                        <Button type='button' variant='outline' className='h-11 px-6'>
                          Hủy
                        </Button>
                      </Link>
                    </div>
                  )}
                </form>
              </Form>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
