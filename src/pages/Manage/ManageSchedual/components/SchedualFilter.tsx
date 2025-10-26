import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import path from '@/constants/path'
import { SchedualQueryConfig } from '@/hooks/useSchedualQueryConfig'
import { getBoolean } from '@/pages/Manage/SchedualDetail/SchedualDetail'
import { parseDate } from '@/utils/utils'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { isUndefined, omitBy } from 'lodash'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { createSearchParams, useNavigate } from 'react-router-dom'

interface Props {
  readonly queryConfig: SchedualQueryConfig
}

const statusPublicSelectionData = [
  { value: 'true', label: 'Công khai' },
  { value: 'false', label: 'Riêng tư' }
]

const modeSelectionData = [
  { value: 'true', label: 'Online' },
  { value: 'false', label: 'Offline' }
]

const typeSelectionData = [
  { value: 'true', label: 'Lịch tư vấn' },
  { value: 'false', label: 'Buổi tư vấn' }
]

export default function SchedualFilter({ queryConfig }: Props) {
  const form = useForm({
    defaultValues: {
      title: '',
      statusPublic: '',
      mode: '',
      type: 'false'
    }
  })

  const navigate = useNavigate()

  const defaultStartDate = parseDate(queryConfig.startDate)
  const defaultEndDate = parseDate(queryConfig.endDate)
  const [startDate, setStartDate] = useState<Date | undefined>(defaultStartDate as Date)
  const [endDate, setEndDate] = useState<Date | undefined>(() => {
    if (defaultEndDate) return defaultEndDate
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    return date
  })

  const statusPublic = getBoolean(form.watch('statusPublic'))
  const mode = getBoolean(form.watch('mode'))
  const type = form.watch('type')

  const onSubmit = form.handleSubmit((values) => {
    const title = values.title
    navigate({
      pathname: path.manageSchedule,
      search: createSearchParams({
        ...queryConfig,
        title
      }).toString()
    })
  })

  useEffect(() => {
    navigate({
      pathname: path.manageSchedule,
      search: createSearchParams(
        omitBy(
          {
            ...queryConfig,
            statusPublic: String(statusPublic),
            mode: String(mode),
            type,
            startDate: startDate ? format(startDate, 'yyyy-MM-dd') : '',
            endDate: endDate ? format(endDate, 'yyyy-MM-dd') : ''
          },
          (value) => isUndefined(value) || value === 'undefined' || value === ''
        )
      ).toString()
    })
  }, [startDate, endDate, statusPublic, mode, type])

  return (
    <div>
      <Form {...form}>
        <form onSubmit={onSubmit}>
          <div>
            <div className='grid grid-cols-4 gap-2 mb-3'>
              <FormField
                control={form.control}
                name='statusPublic'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trạng thái</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Public/Private' />
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
                    <FormLabel>Hình thức</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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
                <FormLabel>Ngày bắt đầu</FormLabel>
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
              <div>
                <FormLabel>Ngày kết thúc</FormLabel>
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
            <div className='grid grid-cols-5 gap-4'>
              <div className='col-span-1'>
                <FormField
                  control={form.control}
                  name='type'
                  render={({ field }) => (
                    <FormItem>
                      <Select onValueChange={field.onChange} defaultValue='false'>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Lịch tư vấn/Buổi tư vấn' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {typeSelectionData.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
              <div className='col-span-3'>
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
              <Button className='col-span-1'>Tìm kiếm</Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}
