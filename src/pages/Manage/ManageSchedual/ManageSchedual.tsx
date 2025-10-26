import { getScheduals } from '@/apis/user.api'
import { exportData } from '@/apis/export.api'
import { Separator } from '@/components/ui/separator'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import path from '@/constants/path'
import { ROLE, Role } from '@/constants/role'
import { AppContext } from '@/contexts/app.context'
import useSchedualQueryConfig from '@/hooks/useSchedualQueryConfig'
import DialogCreateSchedule from '@/pages/Manage/ManageSchedual/components/DialogCreateSchedule'
import SchedualFilter from '@/pages/Manage/ManageSchedual/components/SchedualFilter'
import { SchedualConsultant } from '@/types/consultant.type'
import { Download, Calendar as CalendarIcon, Clock, MapPin, Globe, Users } from 'lucide-react'
import { PlusIcon } from '@radix-ui/react-icons'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useContext } from 'react'
import { useSearchParams, Link } from 'react-router-dom'

// Export Button Component
function ExportCustom({ dataType, queryConfig }: { dataType: string; queryConfig: any }) {
  const exportMutation = useMutation({
    mutationFn: (params: any) => exportData(params)
  })

  const handleExport = (exportType: string) => {
    exportMutation.mutate({
      ...queryConfig,
      dataType,
      exportType
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size='sm' disabled={exportMutation.isPending}>
          <Download className='mr-2 h-4 w-4' />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleExport('pdf')}>Export pdf</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('csv')}>Export excel</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Schedule Item Component
function SchedualItem({ schedual }: { schedual: SchedualConsultant }) {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('vi-VN', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      })
    } catch {
      return dateString
    }
  }

  return (
    <Link to={`/manage/schedules/detail/${schedual.id}`}>
      <Card className='group hover:shadow-xl transition-all duration-300 cursor-pointer border-l-4 border-l-primary mb-3'>
        <CardContent className='p-6'>
          <div className='flex items-start justify-between gap-4'>
            <div className='flex-1 space-y-3'>
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-primary/10 rounded-lg'>
                  <CalendarIcon className='h-5 w-5 text-primary' />
                </div>
                <div>
                  <div className='font-semibold text-lg text-foreground group-hover:text-primary transition-colors'>
                    {schedual?.department?.name ?? 'Tất cả phòng ban'}
                  </div>
                  <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                    <Clock className='h-4 w-4' />
                    <span>{formatDate(schedual?.consultationDate)}</span>
                    <span className='mx-1'>•</span>
                    <span>{schedual?.consultationTime}</span>
                  </div>
                </div>
              </div>
              
              <div className='flex items-start gap-2'>
                <div className='p-2 bg-secondary/50 rounded-lg mt-1'>
                  <MapPin className='h-4 w-4 text-muted-foreground' />
                </div>
                <div>
                  <h3 className='font-medium text-foreground mb-1 line-clamp-2'>{schedual?.title}</h3>
                  <p className='text-xs text-muted-foreground'>Nhấn để xem chi tiết</p>
                </div>
              </div>

              <div className='flex items-center gap-2 flex-wrap'>
                {schedual?.mode ? (
                  <Badge variant='default' className='flex items-center gap-1 bg-blue-500 hover:bg-blue-600'>
                    <Globe className='h-3 w-3' />
                    Online
                  </Badge>
                ) : (
                  <Badge variant='outline' className='flex items-center gap-1'>
                    <MapPin className='h-3 w-3' />
                    Offline
                  </Badge>
                )}
                {schedual?.statusPublic ? (
                  <Badge variant='default' className='flex items-center gap-1 bg-green-500 hover:bg-green-600'>
                    <Users className='h-3 w-3' />
                    Công khai
                  </Badge>
                ) : (
                  <Badge variant='secondary' className='flex items-center gap-1'>
                    <Users className='h-3 w-3' />
                    Riêng tư
                  </Badge>
                )}
              </div>
            </div>
            
            <div className='text-right text-sm text-muted-foreground'>
              <div className='group-hover:translate-x-1 transition-transform duration-200'>
                <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                </svg>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export default function ManageSchedual() {
  const schedualQueryConfig = useSchedualQueryConfig()
  const { role } = useContext(AppContext)
  const [searchParams] = useSearchParams()
  const currentPage = Number(searchParams.get('page')) || 1

  const { data: schedualResponse } = useQuery({
    queryKey: ['schedules', schedualQueryConfig],
    queryFn: () => getScheduals(schedualQueryConfig)
  })
  const schedules = schedualResponse?.data.data.content

  const totalPages = schedualResponse?.data.data.totalPages || 0

  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    return `${path.manageSchedule}?${params.toString()}`
  }

  return (
    <div className='space-y-6'>
      {/* Header Section */}
      <div className='relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8 border border-primary/20'>
        <div className='absolute inset-0 bg-grid-pattern opacity-5'></div>
        <div className='relative'>
          <div className='flex items-center justify-between mb-4'>
            <div className='space-y-2'>
              <h1 className='text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent'>
                Lịch tư vấn
              </h1>
              <p className='text-muted-foreground flex items-center gap-2'>
                <CalendarIcon className='h-4 w-4' />
                Quản lý và điều phối các buổi tư vấn
              </p>
            </div>
            <div className='flex items-center space-x-3'>
              <ExportCustom dataType='consultationSchedule' queryConfig={schedualQueryConfig} />
              {[ROLE.admin as Role, ROLE.advisor as Role, ROLE.consultant as Role].includes(role as Role) && (
                <DialogCreateSchedule>
                  <Button size='lg' className='gap-2 shadow-lg hover:shadow-xl transition-all duration-200'>
                    <PlusIcon className='h-5 w-5' />
                    <span>Thêm buổi tư vấn</span>
                  </Button>
                </DialogCreateSchedule>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className='bg-card rounded-lg border shadow-sm p-5'>
        <SchedualFilter queryConfig={schedualQueryConfig} />
      </div>

      {/* Schedule List */}
      <div className='space-y-2'>
        {schedules && schedules.length > 0 ? (
          schedules.map((schedule) => <SchedualItem key={schedule.id} schedual={schedule} />)
        ) : (
          <Card className='p-12'>
            <CardContent className='flex flex-col items-center justify-center text-center'>
              <div className='p-4 bg-muted rounded-full mb-4'>
                <CalendarIcon className='h-8 w-8 text-muted-foreground' />
              </div>
              <h3 className='text-lg font-semibold mb-2'>Chưa có lịch tư vấn</h3>
              <p className='text-muted-foreground'>Hãy tạo buổi tư vấn đầu tiên của bạn</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='flex justify-center pt-4'>
          <Pagination>
            <PaginationContent>
              {currentPage > 1 && (
                <PaginationItem>
                  <PaginationPrevious
                    to={buildPageUrl(currentPage - 1)}
                    disabled={currentPage === 1}
                  />
                </PaginationItem>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    to={buildPageUrl(page)}
                    isActive={currentPage === page}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              {currentPage < totalPages && (
                <PaginationItem>
                  <PaginationNext
                    to={buildPageUrl(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}
