import { joinSchedule, getScheduleDetail, cancelConsultation, checkJoinConsultation } from '@/apis/consultant.api'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, Building2, UserIcon, Users } from 'lucide-react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import path from '@/constants/path'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

export default function ScheduleActivityDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  // Get schedule detail
  const { data: scheduleResponse, refetch: refetchSchedule } = useQuery({
    queryKey: ['schedule-detail', id],
    queryFn: () => getScheduleDetail(id as string),
    enabled: !!id
  })
  const schedule = scheduleResponse?.data.data

  // Check if user joined
  const { data: checkJoinRes, refetch: refetchCheckJoin } = useQuery({
    queryKey: ['check-join', id],
    queryFn: () => checkJoinConsultation(id as string),
    enabled: !!id
  })
  const isJoined = checkJoinRes?.data.data

  // Join mutation
  const joinMutation = useMutation({
    mutationFn: () => joinSchedule(id as string),
    onSuccess: (res) => {
      toast.success(res.data.message || 'Tham gia hoạt động thành công')
      refetchCheckJoin()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra')
    }
  })

  // Cancel mutation
  const cancelMutation = useMutation({
    mutationFn: () => cancelConsultation(id as string),
    onSuccess: (res) => {
      toast.success(res.data.message || 'Hủy tham gia thành công')
      refetchCheckJoin()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra')
    }
  })

  const handleJoin = () => {
    if (isJoined) {
      cancelMutation.mutate()
    } else {
      joinMutation.mutate()
    }
  }

  // Format date helper
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Chưa cập nhật'
    try {
      const date = new Date(dateString)
      return format(date, 'dd/MM/yyyy', { locale: vi })
    } catch {
      return dateString
    }
  }

  // Format time helper
  const formatTime = (timeString?: string) => {
    if (!timeString) return 'Chưa cập nhật'
    // If time is in format "01:38AM" or similar, just return it
    return timeString
  }

  if (!schedule) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <p className='text-muted-foreground'>Đang tải...</p>
      </div>
    )
  }

  return (
    <div className='container mx-auto px-4 py-8 max-w-4xl'>
      {/* Back button */}
      <Button variant='ghost' onClick={() => navigate(path.home)} className='mb-4'>
        ← Quay lại
      </Button>

      {/* Main content */}
      <div className='bg-white rounded-lg shadow-lg overflow-hidden'>
        {/* Header */}
        <div className='bg-gradient-to-r from-primary to-primary/80 p-6 text-white'>
          <h1 className='text-3xl font-bold mb-2'>{schedule.title}</h1>
          <div className='flex items-center space-x-4 text-white/90'>
            <Badge variant='secondary' className='bg-white/20 text-white'>
              {schedule.mode ? 'Online' : 'Offline'}
            </Badge>
            {isJoined && (
              <Badge variant='default' className='bg-green-500 text-white'>
                ✓ Đã tham gia
              </Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <div className='p-6 space-y-6'>
          {/* Info cards */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='flex items-center space-x-3 p-4 bg-gray-50 rounded-lg'>
              <Calendar className='w-5 h-5 text-primary' />
              <div>
                <p className='text-sm text-muted-foreground'>Ngày tư vấn</p>
                <p className='font-medium'>{formatDate(schedule.consultationDate)}</p>
              </div>
            </div>

            <div className='flex items-center space-x-3 p-4 bg-gray-50 rounded-lg'>
              <Clock className='w-5 h-5 text-primary' />
              <div>
                <p className='text-sm text-muted-foreground'>Giờ tư vấn</p>
                <p className='font-medium'>{formatTime(schedule.consultationTime)}</p>
              </div>
            </div>

            <div className='flex items-center space-x-3 p-4 bg-gray-50 rounded-lg'>
              <Building2 className='w-5 h-5 text-primary' />
              <div>
                <p className='text-sm text-muted-foreground'>Phòng ban</p>
                <p className='font-medium'>{schedule.department?.name || 'Tất cả phòng ban'}</p>
              </div>
            </div>

            {schedule.participantCount !== undefined && (
              <div className='flex items-center space-x-3 p-4 bg-gray-50 rounded-lg'>
                <Users className='w-5 h-5 text-primary' />
                <div>
                  <p className='text-sm text-muted-foreground'>Số lượng tham gia</p>
                  <p className='font-medium'>{schedule.participantCount} người</p>
                </div>
              </div>
            )}

            {schedule.mode ? (
              <div className='flex items-center space-x-3 p-4 bg-gray-50 rounded-lg'>
                <svg className='w-5 h-5 text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' />
                </svg>
                <div>
                  <p className='text-sm text-muted-foreground'>Link meeting</p>
                  <a href={schedule.link} target='_blank' rel='noopener noreferrer' className='font-medium text-blue-600 hover:underline'>
                    {schedule.link}
                  </a>
                </div>
              </div>
            ) : (
              <div className='flex items-center space-x-3 p-4 bg-gray-50 rounded-lg'>
                <svg className='w-5 h-5 text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' />
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
                </svg>
                <div>
                  <p className='text-sm text-muted-foreground'>Địa điểm</p>
                  <p className='font-medium'>{schedule.location}</p>
                </div>
              </div>
            )}
          </div>

          {/* Consultant info */}
          <div className='flex items-center space-x-4 p-4 bg-blue-50 rounded-lg'>
            <Avatar className='w-12 h-12'>
              <AvatarImage src={schedule.consultant?.avatarUrl || schedule.user?.avatarUrl} alt={schedule.consultantName || schedule.userName} />
              <AvatarFallback>
                {schedule.consultantName?.[0] || schedule.userName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className='text-sm text-muted-foreground'>Tư vấn viên</p>
              <p className='font-medium'>{schedule.consultantName || schedule.userName}</p>
            </div>
          </div>

          {/* Content */}
          <div>
            <h2 className='text-xl font-semibold mb-3'>Nội dung</h2>
            <div 
              className='prose max-w-none'
              dangerouslySetInnerHTML={{ __html: schedule.content || '' }}
            />
          </div>

          {/* Action button */}
          <div className='pt-4 border-t'>
            {isJoined ? (
              <div className='space-y-2'>
                <div className='flex items-center justify-center gap-2 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200'>
                  <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                  </svg>
                  <span className='font-medium'>Bạn đã tham gia hoạt động này</span>
                </div>
                <Button
                  onClick={handleJoin}
                  disabled={joinMutation.isPending || cancelMutation.isPending}
                  size='lg'
                  className='w-full'
                  variant='outline'
                >
                  {cancelMutation.isPending ? 'Đang xử lý...' : 'Hủy tham gia'}
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleJoin}
                disabled={joinMutation.isPending || cancelMutation.isPending}
                size='lg'
                className='w-full'
                variant='default'
              >
                {joinMutation.isPending ? 'Đang xử lý...' : 'Tham gia hoạt động'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
