import { getAllDepartments } from '@/apis/department.api'
import { getAllQuestionStatus } from '@/apis/question.api'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ROLE, Role } from '@/constants/role'
import { AppContext } from '@/contexts/app.context'
import { QuestionQueryConfig } from '@/hooks/useQuestionQueryConfig'
import { QuestionStatus } from '@/types/question.type'
import { FormControlItem } from '@/types/utils.type'
import { generateSelectionData, parseDate } from '@/utils/utils'
import { useQuery } from '@tanstack/react-query'
import { CalendarIcon } from 'lucide-react'
import { useContext, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { createSearchParams, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface Props {
  readonly queryConfig: QuestionQueryConfig
  readonly path: string
}

export default function QuestionFilter({ queryConfig, path }: Props) {
  const { role } = useContext(AppContext)
  const navigate = useNavigate()

  const form = useForm({
    defaultValues: {
      departmentId: queryConfig.departmentId,
      status: queryConfig.status,
      title: queryConfig.title
    }
  })

  const departmentId = form.watch('departmentId')
  const status = form.watch('status')

  const defaultStartDate = parseDate(queryConfig.startDate)
  const defaultEndDate = parseDate(queryConfig.endDate)
  const [startDate, setStartDate] = useState<Date | undefined>(defaultStartDate as Date)
  const [endDate, setEndDate] = useState<Date | undefined>(() => {
    if (defaultEndDate) return defaultEndDate
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    return date
  })

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: getAllDepartments
  })

  // generate selection data
  const departmentsSelectionData: FormControlItem[] | undefined = useMemo(() => {
    const data = departments?.data.data
    return generateSelectionData(data)
  }, [departments])

  const { data: questionsStatus } = useQuery({
    queryKey: ['questionsStatus'],
    queryFn: getAllQuestionStatus
  })

  // generate selection data
  const questionsStatusSelectionData: FormControlItem[] | undefined = useMemo(() => {
    const data = questionsStatus?.data.data
    return data?.map((item: QuestionStatus) => {
      return {
        value: String(item.key),
        label: item.displayName
      }
    })
  }, [questionsStatus])

  // handle find questions with title
  const onSubmit = form.handleSubmit((values) => {
    const title = values.title
    if (title) {
      navigate({
        pathname: path,
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
      pathname: path,
      search: createSearchParams({
        ...queryConfig,
        departmentId: departmentId || '',
        status: status || '',
        startDate: startDate ? format(startDate, 'yyyy-MM-dd') : '',
        endDate: endDate ? format(endDate, 'yyyy-MM-dd') : ''
      }).toString()
    })
  }, [departmentId, status, startDate, endDate])

  return (
    <Form {...form}>
      <form onSubmit={onSubmit}>
        <div
          className={cn('grid gap-4 mb-4', {
            'grid-cols-3': [ROLE.advisor as Role, ROLE.consultant as Role].includes(role as Role),
            'grid-cols-4': [ROLE.user as Role, ROLE.admin as Role].includes(role as Role)
          })}
        >
          {[ROLE.user as Role, ROLE.admin as Role].includes(role as Role) && (
            <div
              className={cn('lg:col-span-1', {
                'col-span-3': [ROLE.advisor as Role, ROLE.consultant as Role].includes(role as Role),
                'col-span-4': [ROLE.user as Role, ROLE.admin as Role].includes(role as Role)
              })}
            >
              <FormField
                control={form.control}
                name="departmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Đơn vị</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Đơn vị" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="z-[2147483647] bg-white border shadow-lg">
                        {departmentsSelectionData?.map((item) => (
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
          )}
          <div
            className={cn('lg:col-span-1', {
              'col-span-3': [ROLE.advisor as Role, ROLE.consultant as Role].includes(role as Role),
              'col-span-4': [ROLE.user as Role, ROLE.admin as Role].includes(role as Role)
            })}
          >
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trạng thái</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Trạng thái" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="z-[2147483647] bg-white border shadow-lg">
                      {questionsStatusSelectionData?.map((item) => (
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
          <div
            className={cn('lg:col-span-1', {
              'col-span-3': [ROLE.advisor as Role, ROLE.consultant as Role].includes(role as Role),
              'col-span-4': [ROLE.user as Role, ROLE.admin as Role].includes(role as Role)
            })}
          >
            <FormItem>
              <FormLabel>Ngày bắt đầu</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "dd/MM/yyyy") : "Chọn ngày bắt đầu"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-[2147483647] bg-white border shadow-lg">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </FormItem>
          </div>
          <div
            className={cn('lg:col-span-1', {
              'col-span-3': [ROLE.advisor as Role, ROLE.consultant as Role].includes(role as Role),
              'col-span-4': [ROLE.user as Role, ROLE.admin as Role].includes(role as Role)
            })}
          >
            <FormItem>
              <FormLabel>Ngày kết thúc</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "dd/MM/yyyy") : "Chọn ngày kết thúc"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-[2147483647] bg-white border shadow-lg">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </FormItem>
          </div>
        </div>
        <div className="grid grid-cols-5 gap-4">
          <div className="col-span-3 lg:col-span-3">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Nhập tiêu đề để tìm kiếm" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <div className="col-span-2 lg:col-span-1 flex items-center">
            <Button className="w-full" type="submit">Tìm kiếm</Button>
          </div>
        </div>
      </form>
    </Form>
  )
}
