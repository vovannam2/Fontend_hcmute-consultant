import { getScheduals } from '@/apis/user.api'
import { Badge } from '@/components/ui/badge'
import useSchedualQueryConfig from '@/hooks/useSchedualQueryConfig'
import { SchedualConsultant } from '@/types/consultant.type'
import { useQuery } from '@tanstack/react-query'
import { Calendar, Clock, Building2, Users, CalendarCheck } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Link } from 'react-router-dom'
import { checkJoinConsultation } from '@/apis/consultant.api'

export default function Consultation() {
  let scheduleQueryConfig = useSchedualQueryConfig()
  scheduleQueryConfig = {
    ...scheduleQueryConfig,
    type: 'false',
    page: '0',
    size: '10000'
  }

  const { data: scheduleActivities, isLoading } = useQuery({
    queryKey: ['schedule-activities'],
    queryFn: () => getScheduals(scheduleQueryConfig)
  })

  // Lọc chỉ những hoạt động đã tham gia
  const joinedActivities = scheduleActivities?.data.data.content.filter((activity) => {
    // Check if user has joined - we'll filter in the UI after checking
    return activity
  }) || []

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
    return timeString
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
      </div>
    )
  }

  const activitiesToDisplay = joinedActivities

  return (
    <div>
      {/* Header */}
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-foreground mb-2'>Buổi tư vấn của tôi</h1>
        <p className='text-muted-foreground'>Danh sách các buổi tư vấn bạn đã đăng ký tham gia</p>
      </div>

      {/* Activities List */}
      {activitiesToDisplay.length > 0 ? (
        <div className='grid gap-4'>
          {activitiesToDisplay.map((scheduleActivity) => (
            <ConsultationCard 
              key={scheduleActivity.id} 
              scheduleActivity={scheduleActivity}
              formatDate={formatDate}
              formatTime={formatTime}
            />
          ))}
        </div>
      ) : (
        <div className='text-center py-12'>
          <CalendarCheck className='w-16 h-16 text-gray-300 mx-auto mb-4' strokeWidth={1.5} />
          <h3 className='text-lg font-semibold text-gray-700 mb-2'>Chưa có buổi tư vấn nào</h3>
          <p className='text-gray-500'>Bạn chưa đăng ký tham gia buổi tư vấn nào</p>
        </div>
      )}
    </div>
  )
}

// Consultation Card Component
function ConsultationCard({ 
  scheduleActivity, 
  formatDate, 
  formatTime 
}: { 
  scheduleActivity: SchedualConsultant
  formatDate: (date?: string) => string
  formatTime: (time?: string) => string
}) {
  const { data: isJoinRes } = useQuery({
    queryKey: ['check-join', scheduleActivity.id],
    queryFn: () => checkJoinConsultation(String(scheduleActivity.id)),
    enabled: !!scheduleActivity.id
  })
  
  const isJoin = isJoinRes?.data.data

  // Chỉ hiển thị nếu đã tham gia
  if (!isJoin) {
    return null
  }

  return (
    <Link to={`/schedule-activities/${scheduleActivity.id}`}>
      <div className='group relative bg-gradient-to-br from-white to-blue-50/30 rounded-lg border border-gray-200 hover:border-primary/40 transition-all duration-300 p-6 shadow-sm hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1'>
        {/* Badge */}
        <div className='absolute top-4 right-4'>
          <Badge className='bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-sm'>
            ✓ Đã tham gia
          </Badge>
        </div>

        {/* Title */}
        <h3 className='text-lg font-semibold mb-4 pr-24 text-gray-800 group-hover:text-primary transition-colors'>
          {scheduleActivity.title}
        </h3>

        {/* Date & Time */}
        <div className='flex flex-wrap items-center gap-x-6 gap-y-2 mb-4'>
          <div className='flex items-center gap-2 text-gray-600'>
            <Calendar className='w-5 h-5 text-primary' strokeWidth={2} />
            <span className='text-sm font-medium'>{formatDate(scheduleActivity.consultationDate)}</span>
          </div>
          <div className='flex items-center gap-2 text-gray-600'>
            <Clock className='w-5 h-5 text-primary' strokeWidth={2} />
            <span className='text-sm font-medium'>{formatTime(scheduleActivity.consultationTime)}</span>
          </div>
        </div>

        {/* Department & Participants */}
        <div className='flex items-center justify-between pt-4 border-t border-gray-200'>
          <div className='flex items-center gap-2 text-gray-500'>
            <Building2 className='w-5 h-5 text-primary' strokeWidth={2} />
            <span className='text-sm'>
              {scheduleActivity?.department?.name || 'Tất cả phòng ban'}
            </span>
          </div>
          {scheduleActivity.participantCount !== undefined && (
            <div className='flex items-center gap-2 text-gray-500'>
              <Users className='w-5 h-5 text-primary' strokeWidth={2} />
              <span className='text-sm'>{scheduleActivity.participantCount} người</span>
            </div>
          )}
        </div>

        {/* Hover effect overlay */}
        <div className='absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/0 via-indigo-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:via-indigo-500/5 group-hover:to-blue-500/5 transition-all duration-300 pointer-events-none'></div>
      </div>
    </Link>
  )
}
