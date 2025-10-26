import { checkJoinConsultation } from '@/apis/consultant.api'
import { Badge } from '@/components/ui/badge'
import { SchedualConsultant } from '@/types/consultant.type'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Calendar, Clock, Building2, Users } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

interface Props {
  readonly scheduleActivity: SchedualConsultant
}

export default function ConsultActivity({ scheduleActivity }: Props) {
  const id = scheduleActivity.id
  const { data: isJoinRes } = useQuery({
    queryKey: ['check-join', id],
    queryFn: () => checkJoinConsultation(String(id))
  })
  const isJoin = isJoinRes?.data.data

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

  return (
    <Link to={`/schedule-activities/${scheduleActivity.id}`}>
      <div
        className='group relative bg-white rounded-lg border border-gray-100 hover:border-primary/40 
        transition-all duration-300 p-4 shadow-sm hover:shadow-md hover:shadow-primary/5
        hover:-translate-y-0.5'
      >
        {/* Gradient border on hover */}
        <div className='absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/0 via-indigo-500/0 to-blue-500/0 
          group-hover:from-blue-500/5 group-hover:via-indigo-500/5 group-hover:to-blue-500/5 
          transition-all duration-300 pointer-events-none'></div>

        <div className='relative'>
          {/* Badge */}
          <div className='absolute top-0 right-0'>
            <Badge
              variant={isJoin ? 'default' : 'outline'}
              className={`text-xs px-2.5 py-0.5 ${
                isJoin
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-sm'
                  : 'bg-gray-50 text-gray-600'
              }`}
            >
              {isJoin ? '✓ Đã tham gia' : 'Chưa tham gia'}
            </Badge>
          </div>

          {/* Title */}
          <h3 className='text-base font-semibold mb-3 pr-20 text-gray-800 group-hover:text-primary transition-colors line-clamp-2'>
            {scheduleActivity.title}
          </h3>

          {/* Date & Time */}
          <div className='flex flex-wrap items-center gap-x-4 gap-y-2 mb-3'>
            <div className='flex items-center gap-1.5 text-gray-600'>
              <Calendar className='w-4 h-4 text-primary' strokeWidth={2} />
              <span className='text-sm font-medium'>{formatDate(scheduleActivity.consultationDate)}</span>
            </div>
            <div className='flex items-center gap-1.5 text-gray-600'>
              <Clock className='w-4 h-4 text-primary' strokeWidth={2} />
              <span className='text-sm font-medium'>{formatTime(scheduleActivity.consultationTime)}</span>
            </div>
          </div>

          {/* Department & Participants */}
          <div className='flex items-center justify-between pt-2 border-t border-gray-100'>
            <div className='flex items-center gap-1.5 text-gray-500'>
              <Building2 className='w-4 h-4 text-primary' strokeWidth={2} />
              <span className='text-sm'>
                {scheduleActivity?.department?.name || 'Tất cả phòng ban'}
              </span>
            </div>
            {scheduleActivity.participantCount !== undefined && (
              <div className='flex items-center gap-1.5 text-gray-500'>
                <Users className='w-4 h-4 text-primary' strokeWidth={2} />
                <span className='text-sm'>{scheduleActivity.participantCount} người</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
