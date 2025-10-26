import { getScheduals } from '@/apis/user.api'
import useSchedualQueryConfig from '@/hooks/useSchedualQueryConfig'
import ConsultActivity from '@/pages/User/Home/components/ListConsultActivity/components/ConsultActivity'
import { useQuery } from '@tanstack/react-query'
import { CalendarCheck } from 'lucide-react'

export default function ListConsultActivity() {
  let scheduleQueryConfig = useSchedualQueryConfig()
  scheduleQueryConfig = {
    ...scheduleQueryConfig,
    type: 'false',
    page: '0',
    size: '10000'
  }
  const { data: scheduleActivities } = useQuery({
    queryKey: ['schedule-activities'],
    queryFn: () => getScheduals(scheduleQueryConfig)
  })

  const displayActivities = scheduleActivities?.data.data.content.slice(0, 2) || []

  return (
    <div className='relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 border border-blue-100 rounded-xl shadow-lg'>
      {/* Decorative background pattern */}
      <div className='absolute inset-0 bg-[url("/grid-pattern.svg")] opacity-5'></div>
      
      {/* Header */}
      <div className='relative px-4 py-3 border-b border-blue-100 bg-gradient-to-r from-blue-500/10 to-indigo-500/10'>
        <div className='flex items-center gap-3'>
          <div className='p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 shadow-md'>
            <CalendarCheck className='w-5 h-5 text-white' strokeWidth={2} />
          </div>
          <div>
            <h3 className='font-semibold text-foreground'>Hoạt động tư vấn</h3>
            <p className='text-xs text-muted-foreground'>Các buổi tư vấn sắp tới</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='relative p-4'>
        {displayActivities.length > 0 ? (
          <ul className='space-y-3'>
            {displayActivities.map((scheduleActivity) => (
              <ConsultActivity key={scheduleActivity.id} scheduleActivity={scheduleActivity} />
            ))}
          </ul>
        ) : (
          <div className='flex items-center justify-center py-8'>
            <div className='text-center'>
              <CalendarCheck className='w-10 h-10 text-gray-300 mx-auto mb-2' strokeWidth={1.5} />
              <p className='text-sm text-gray-500'>Chưa có hoạt động tư vấn</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
