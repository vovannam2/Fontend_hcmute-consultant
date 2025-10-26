import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import path from '@/constants/path'
import { ForwardQuestionQueryConfig } from '@/hooks/useForwardQuestionQueryConfig'
import { parseDate } from '@/utils/utils'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { createSearchParams, useNavigate } from 'react-router-dom'

interface Props {
  readonly queryConfig: ForwardQuestionQueryConfig
}

export default function ManageForwardQuestionFilter({ queryConfig }: Props) {
  const navigate = useNavigate()

  const form = useForm({
    defaultValues: {
      title: queryConfig.title
    }
  })

  const defaultStartDate = parseDate(queryConfig.startDate)
  const defaultEndDate = parseDate(queryConfig.endDate)
  const [startDate, setStartDate] = useState<Date | undefined>(defaultStartDate as Date)
  const [endDate, setEndDate] = useState<Date | undefined>(() => {
    if (defaultEndDate) return defaultEndDate
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    return date
  })

  // handle find forward questions with title
  const onSubmit = form.handleSubmit((values) => {
    const title = values.title
    if (title) {
      navigate({
        pathname: path.manageForwardQuestion,
        search: createSearchParams({
          ...queryConfig,
          title
        }).toString()
      })
    }
  })

  // when form values change, navigate to get new data with new params
  useEffect(() => {
    navigate({
      pathname: path.manageForwardQuestion,
      search: createSearchParams({
        ...queryConfig,
        startDate: startDate ? format(startDate, 'yyyy-MM-dd') : '',
        endDate: endDate ? format(endDate, 'yyyy-MM-dd') : ''
      }).toString()
    })
  }, [startDate, endDate])

  return (
    <Form {...form}>
      <form onSubmit={onSubmit}>
        <div className='grid grid-cols-4 gap-2 mb-4'>
          <div className='col-span-1'>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant='outline'
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !startDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className='mr-2 h-4 w-4' />
                  {startDate ? format(startDate, 'dd/MM/yyyy') : <span>Chọn ngày bắt đầu</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-auto p-0' align='start'>
                <Calendar
                  mode='single'
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className='col-span-1'>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant='outline'
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !endDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className='mr-2 h-4 w-4' />
                  {endDate ? format(endDate, 'dd/MM/yyyy') : <span>Chọn ngày kết thúc</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-auto p-0' align='start'>
                <Calendar
                  mode='single'
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className='grid grid-cols-5 gap-2 mb-4'>
          <div className='col-span-4'>
            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder='Nhập tiêu đề để tìm kiếm' {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <div className='col-span-1 flex items-center'>
            <Button className='w-full'>Tìm kiếm</Button>
          </div>
        </div>
      </form>
    </Form>
  )
}
