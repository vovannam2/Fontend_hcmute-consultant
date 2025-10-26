import { getNotifications, getUnreadCount, markAllAsRead, markAsRead } from '@/apis/notification.api'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { NotificationResponse } from '@/types/notification.type'
import { formatDate } from '@/utils/utils'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState, useContext, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { AppContext } from '@/contexts/app.context'

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'SUCCESS':
      return <div className='size-4 rounded-full bg-green-500 flex items-center justify-center'>
        <svg className='size-2.5 text-white' fill='currentColor' viewBox='0 0 20 20'>
          <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
        </svg>
      </div>
    case 'ERROR':
      return <div className='size-4 rounded-full bg-red-500 flex items-center justify-center'>
        <svg className='size-2.5 text-white' fill='currentColor' viewBox='0 0 20 20'>
          <path fillRule='evenodd' d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z' clipRule='evenodd' />
        </svg>
      </div>
    case 'UPDATE':
      return <div className='size-4 rounded-full bg-blue-500 flex items-center justify-center'>
        <svg className='size-2.5 text-white' fill='currentColor' viewBox='0 0 20 20'>
          <path fillRule='evenodd' d='M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z' clipRule='evenodd' />
        </svg>
      </div>
    default:
      return <div className='size-4 rounded-full bg-gray-500 flex items-center justify-center'>
        <svg className='size-2.5 text-white' fill='currentColor' viewBox='0 0 20 20'>
          <path fillRule='evenodd' d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z' clipRule='evenodd' />
        </svg>
      </div>
  }
}

export default function HeaderNotification() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { unreadNotificationCount, setUnreadNotificationCount } = useContext(AppContext)
  const [isMarkingAllAsRead, setIsMarkingAllAsRead] = useState(false)
  const [markAllSuccess, setMarkAllSuccess] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications
  })

  const { data: unreadCountData } = useQuery({
    queryKey: ['unread-count'],
    queryFn: getUnreadCount
  })

  const notificationsData = useMemo(() => {
    // Debug: Log API response
    
    // Lấy danh sách thông báo từ API response
    // API trả về: { status, message, data: { content: [...], pageable: {...} } }
    const list = notifications?.data?.data?.content || []

    // Sắp xếp theo thời gian mới nhất
    const sortedList = [...list].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())

    // Chỉ lấy 5 thông báo mới nhất
    const result = sortedList.slice(0, 5)
    return result
  }, [notifications])

  const unreadCount = useMemo(() => {
    // Ưu tiên sử dụng API unread count (chính xác nhất)
    if (unreadCountData?.data?.data?.count !== undefined) {
      return unreadCountData.data.data.count
    }
    
    // Fallback: sử dụng context count (từ socket realtime)
    return unreadNotificationCount
  }, [unreadCountData, unreadNotificationCount])

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleNotificationClick = async (notification: NotificationResponse) => {
    // Đánh dấu đã đọc nếu chưa đọc
    if (notification.status === 'UNREAD') {
      try {
        await markAsRead(notification.id)
        queryClient.invalidateQueries({ queryKey: ['notifications'] })
        setUnreadNotificationCount(prev => Math.max(0, prev - 1))
      } catch (error) {
        console.error('Lỗi khi đánh dấu đã đọc:', error)
      }
    }

    // Đóng dropdown
    setIsOpen(false)

    // Lưu ID thông báo vào localStorage để sử dụng trong NotificationPage
    localStorage.setItem('selectedNotificationId', notification.id.toString())

    // Chuyển hướng đến trang chi tiết thông báo
    navigate('/notifications')
  }

  const handleMarkAllAsRead = async () => {
    if (isMarkingAllAsRead) return // Tránh gọi API nhiều lần nếu đang processing

    try {
      setIsMarkingAllAsRead(true)

      const response = await markAllAsRead()

      // Hard refresh query (với fetchOptions để force refresh từ server)
      await queryClient.resetQueries({ queryKey: ['notifications'] })
      await queryClient.invalidateQueries({ queryKey: ['notifications'], refetchType: 'all' })

      // Reset unread count
      setUnreadNotificationCount(0)

      // Hiển thị thông báo thành công
      setMarkAllSuccess(true)
      setTimeout(() => {
        setMarkAllSuccess(false)
        setIsOpen(false) // Đóng dropdown sau khi hiển thị thông báo thành công
      }, 3000) // Ẩn thông báo sau 3 giây
    } catch (error) {
      console.error('Lỗi chi tiết khi đánh dấu tất cả đã đọc:', error)
      alert('Không thể đánh dấu tất cả đã đọc. Vui lòng thử lại sau.')
    } finally {
      setIsMarkingAllAsRead(false)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button 
        variant="ghost" 
        size="icon" 
        className="relative rounded-xl hover:bg-orange-50 hover:text-orange-600 transition-all duration-200 group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5 group-hover:animate-pulse" />
        {unreadCount > 0 && (
          <div className='absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center bg-gradient-to-r from-orange-500 to-red-500 text-white border-2 border-white shadow-lg animate-pulse rounded-full'>
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        )}
      </Button>
      
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border-2 border-gray-200 rounded-lg shadow-2xl z-[999999]">
        <div className='flex items-center justify-between p-4 border-b'>
          <h3 className='font-medium text-sm'>Thông báo</h3>
          {unreadCount > 0 ? (
            <>
              <Button
                variant='outline'
                size='sm'
                className='text-xs h-8 flex items-center gap-1.5 border-primary text-primary hover:bg-primary/10'
                onClick={handleMarkAllAsRead}
                disabled={isMarkingAllAsRead}
              >
                {isMarkingAllAsRead ? (
                  <>
                    <span className='animate-spin h-3 w-3 border-2 border-primary border-t-transparent rounded-full mr-1'></span>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <svg className='size-3.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                    </svg>
                    Đánh dấu tất cả đã đọc
                  </>
                )}
              </Button>

              <button
                type='button'
                className='ml-2 p-1 bg-primary text-white text-[10px] rounded hidden'
                onClick={() => {
                  markAllAsRead()
                    .then(() => {
                      queryClient.invalidateQueries({ queryKey: ['notifications'] })
                    })
                    .catch((e) => console.error('Lỗi từ nút dự phòng:', e))
                }}
              >
                Test API
              </button>
            </>
          ) : markAllSuccess ? (
            <span className='text-xs text-green-600 flex items-center gap-1'>
              <svg className='size-3.5' fill='currentColor' viewBox='0 0 20 20'>
                <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
              </svg>
              Đã đánh dấu tất cả đã đọc
            </span>
          ) : null}
        </div>
        <div className='max-h-80 overflow-y-auto'>
          {notificationsData.length > 0 ? (
            <div>
              {notificationsData.map((notification: NotificationResponse) => (
                <div
                  key={notification.id}
                  className={`p-3 hover:bg-accent cursor-pointer ${notification.status === 'UNREAD' ? 'bg-accent/50' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className='flex items-start gap-3'>
                    {getNotificationIcon(notification.notificationType)}
                    <div className='flex-1 min-w-0'>
                      <p className={`text-sm ${notification.status === 'UNREAD' ? 'font-medium' : ''}`}>
                        {notification.content}
                      </p>
                      <div className='flex items-center gap-2 text-xs text-muted-foreground mt-1'>
                        {notification.senderId && (
                          <>
                            <span>Từ: {notification.senderId.fullName}</span>
                            <span>•</span>
                          </>
                        )}
                        <span>{formatDate(notification.time, true)}</span>
                        {notification.status === 'UNREAD' && (
                          <>
                            <span>•</span>
                            <span className='text-primary'>Chưa đọc</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <Separator />
              <div className='p-2'>
                <Link to='/notifications'>
                  <Button variant='ghost' className='w-full text-primary' size='sm'>
                    Xem tất cả thông báo
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center py-8 text-muted-foreground text-sm'>
              <Bell className='size-8 mb-2 text-muted' />
              <p>Chưa có thông báo nào</p>
            </div>
          )}
        </div>
        </div>
      )}
    </div>
  )
}
