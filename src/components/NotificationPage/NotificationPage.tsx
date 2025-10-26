import { getNotificationDetail, getNotifications, markAllAsRead, markAsRead, deleteAllNotifications } from '@/apis/notification.api'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { NotificationResponse } from '@/types/notification.type'
import { formatDate } from '@/utils/utils'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

const getNotificationIcon = (type: string) => {
  const iconClass = "size-6 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
  
  switch (type) {
    case 'SUCCESS':
      return <div className={`${iconClass} bg-gradient-to-br from-green-400 to-green-600 animate-pulse`}>
        <svg className='size-4 text-white' fill='currentColor' viewBox='0 0 20 20'>
          <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
        </svg>
      </div>
    case 'ERROR':
      return <div className={`${iconClass} bg-gradient-to-br from-red-400 to-red-600 animate-bounce`}>
        <svg className='size-4 text-white' fill='currentColor' viewBox='0 0 20 20'>
          <path fillRule='evenodd' d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z' clipRule='evenodd' />
        </svg>
      </div>
    case 'UPDATE':
      return <div className={`${iconClass} bg-gradient-to-br from-blue-400 to-blue-600 animate-spin`}>
        <svg className='size-4 text-white' fill='currentColor' viewBox='0 0 20 20'>
          <path fillRule='evenodd' d='M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z' clipRule='evenodd' />
        </svg>
      </div>
    default:
      return <div className={`${iconClass} bg-gradient-to-br from-gray-400 to-gray-600 hover:from-purple-400 hover:to-purple-600`}>
        <svg className='size-4 text-white' fill='currentColor' viewBox='0 0 20 20'>
          <path fillRule='evenodd' d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z' clipRule='evenodd' />
        </svg>
      </div>
  }
}

export default function NotificationsPage() {
  const queryClient = useQueryClient()
  const [selectedNotificationId, setSelectedNotificationId] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications
  })

  const { data: notificationDetail, isLoading: isLoadingDetail } = useQuery({
    queryKey: ['notification', selectedNotificationId],
    queryFn: () => getNotificationDetail(selectedNotificationId!),
    enabled: selectedNotificationId !== null
  })

  // Xử lý URL state và browser back button
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const notificationId = urlParams.get('notificationId')
    
    if (notificationId) {
      setSelectedNotificationId(notificationId)
    } else {
      // Kiểm tra localStorage nếu không có trong URL
    const savedId = localStorage.getItem('selectedNotificationId')
    if (savedId) {
      setSelectedNotificationId(savedId)
      localStorage.removeItem('selectedNotificationId') 
        // Cập nhật URL để phản ánh state (replace để không tạo history entry mới)
        updateURL(savedId, true)
      }
    }
  }, [])

  // Cập nhật URL khi chọn notification
  const updateURL = (notificationId: string | null, replace: boolean = false) => {
    const url = new URL(window.location.href)
    if (notificationId) {
      url.searchParams.set('notificationId', notificationId)
    } else {
      url.searchParams.delete('notificationId')
    }
    
    if (replace) {
      window.history.replaceState({}, '', url.toString())
    } else {
      window.history.pushState({}, '', url.toString())
    }
  }

  // Xử lý browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search)
      const notificationId = urlParams.get('notificationId')
      setSelectedNotificationId(notificationId)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    if (selectedNotificationId && notificationDetail?.data.data.status === 'UNREAD') {
      markAsRead(selectedNotificationId.toString()).then(() => {
        queryClient.invalidateQueries({ queryKey: ['notifications'] })
      })
    }
  }, [selectedNotificationId, notificationDetail, queryClient])

  const notificationsList = notifications?.data.data.content || []
  const unreadNotifications = notificationsList.filter((notice: NotificationResponse) => notice.status === 'UNREAD')
  const readNotifications = notificationsList.filter((notice: NotificationResponse) => notice.status === 'READ')
  
  // Lấy tổng số thông báo từ API response
  const totalNotifications = notifications?.data.data.totalElements || 0

  // Animation styles for notifications
  const notificationItemStyle = "group p-6 rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-accent/50 hover:to-accent/30 cursor-pointer border border-transparent hover:border-primary/20 hover:shadow-lg hover:scale-[1.02] backdrop-blur-sm"

  const handleNotificationClick = async (notification: NotificationResponse) => {
    if (notification.status === 'UNREAD') {
      try {
        await markAsRead(notification.id)
        queryClient.invalidateQueries({ queryKey: ['notifications'] })
      } catch (error) {
        console.error('Lỗi khi đánh dấu đã đọc:', error)
      }
    }
    setSelectedNotificationId(notification.id.toString())
    // Sử dụng pushState để tạo history entry mới
    updateURL(notification.id.toString(), false)
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    } catch (error) {
      console.error('Lỗi khi đánh dấu tất cả đã đọc:', error)
    }
  }

  const handleMarkButtonClick = async (event: React.MouseEvent, notification: NotificationResponse) => {
    event.stopPropagation() 
    
    if (notification.status === 'UNREAD') {
      try {
        await markAsRead(notification.id)
        queryClient.invalidateQueries({ queryKey: ['notifications'] })
      } catch (error) {
        console.error('Lỗi khi đánh dấu đã đọc:', error)
      }
    }
  }

  const handleBackToList = () => {
    setSelectedNotificationId(null)
    // Sử dụng pushState để tạo history entry mới khi quay lại danh sách
    updateURL(null, false)
  }

  const handleDeleteAll = async () => {
    try {
      await deleteAllNotifications()
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      setSuccessMessage('Đã xóa tất cả thông báo thành công!')
      
      setTimeout(() => {
        setSuccessMessage(null)
      }, 5000)
    } catch (error: any) {
      console.error('Lỗi khi xóa tất cả thông báo:', error)
      
      if (error && typeof error === 'object' && error.response?.data?.message) {
        alert(`Lỗi: ${error.response.data.message}`);
      } else if (error && typeof error === 'object' && error.message && error.message.includes('transaction')) {
        alert('Lỗi giao dịch từ hệ thống. Vui lòng liên hệ admin để thêm @Transactional cho phương thức xóa tất cả.');
      } else {
        alert('Có lỗi xảy ra khi xóa thông báo. Vui lòng thử lại sau hoặc liên hệ admin.');
      }
    }
  }

  if (selectedNotificationId !== null) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 mt-[var(--header-height)]'>
        <div className='w-full max-w-4xl mx-auto'>
          <div className='flex items-center gap-4 mb-8'>
            <Button 
              variant='ghost' 
              size='lg' 
              onClick={handleBackToList} 
              className='flex items-center gap-3 hover:bg-white/80 hover:shadow-lg transition-all duration-300 rounded-xl px-6 py-3'
            >
              <svg className='size-5 text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
            </svg>
              <span className='font-medium'>Quay lại</span>
          </Button>
            <div className='flex items-center gap-3'>
              <div className='p-3 rounded-full bg-gradient-to-br from-primary/20 to-primary/10'>
                <svg className='size-6 text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 17h5l-5 5v-5zM4 19h6v-6H4v6zM4 5h6V1H4v4zM15 3h5v5h-5V3z' />
                </svg>
              </div>
              <h1 className='text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent'>
                Chi tiết thông báo
              </h1>
            </div>
        </div>

          <Card className='p-8 bg-white/80 backdrop-blur-sm border-0 shadow-2xl rounded-2xl'>
          {isLoadingDetail ? (
              <div className='flex flex-col items-center justify-center py-16'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4'></div>
                <p className='text-lg text-muted-foreground'>Đang tải...</p>
              </div>
          ) : notificationDetail ? (
              <div className='space-y-6'>
                <div className='flex items-start gap-6 p-6 rounded-xl bg-gradient-to-r from-accent/30 to-accent/10 border border-accent/20'>
                  <div className='flex-shrink-0'>
                {getNotificationIcon(notificationDetail.data.data.notificationType)}
                  </div>
                  <div className='flex-1'>
                    <h2 className='text-2xl font-semibold mb-3 text-foreground leading-relaxed'>
                    {notificationDetail.data.data.content}
                  </h2>
                    <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                      <svg className='size-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                      </svg>
                      <span>{formatDate(notificationDetail.data.data.time, true)}</span>
                    </div>
                  </div>
                </div>
                
                <div className='mt-8 pt-6 border-t border-border/50'>
                  <div className='flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50'>
                    <div className='p-2 rounded-full bg-blue-100'>
                      <svg className='size-5 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                      </svg>
              </div>
                    <p className='text-muted-foreground'>
                  Thông báo được gửi từ hệ thống tư vấn học tập HCMUTE.
                </p>
                  </div>
              </div>
            </div>
          ) : (
              <div className='flex flex-col items-center justify-center py-16 text-center'>
                <div className='p-4 rounded-full bg-red-100 mb-4'>
                  <svg className='size-8 text-red-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z' />
                  </svg>
                </div>
                <h3 className='text-xl font-semibold text-muted-foreground mb-2'>Không tìm thấy thông báo</h3>
                <p className='text-muted-foreground'>Thông báo này có thể đã bị xóa hoặc không tồn tại.</p>
            </div>
          )}
        </Card>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 mt-[var(--header-height)]'>
      <div className='w-full max-w-6xl mx-auto'>
        {/* Header Section */}
        <div className='text-center mb-12'>
          <div className='flex items-center justify-center gap-4 mb-6'>
            <div className='p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 shadow-lg'>
              <svg className='size-8 text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 17h5l-5 5v-5zM4 19h6v-6H4v6zM4 5h6V1H4v4zM15 3h5v5h-5V3z' />
          </svg>
            </div>
            <h1 className='text-4xl font-bold bg-gradient-to-r from-primary via-blue-600 to-indigo-600 bg-clip-text text-transparent'>
              Thông báo của bạn
            </h1>
        </div>
          
          <div className='flex flex-wrap items-center justify-center gap-3'>
          <Button 
            variant='outline' 
              size='lg' 
              className='flex items-center gap-3 hover:bg-white/80 hover:shadow-lg transition-all duration-300 rounded-xl px-6 py-3 border-primary/20'
            onClick={handleMarkAllAsRead}
          >
              <svg className='size-5 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
            </svg>
              <span className='font-medium'>Đánh dấu tất cả đã đọc</span>
          </Button>
            <Button 
              variant='outline' 
              size='lg' 
              className='flex items-center gap-3 hover:bg-white/80 hover:shadow-lg transition-all duration-300 rounded-xl px-6 py-3 border-red-200 hover:border-red-300' 
              onClick={handleDeleteAll}
            >
              <svg className='size-5 text-red-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
            </svg>
              <span className='font-medium'>Xóa tất cả</span>
          </Button>
        </div>
      </div>

      {successMessage && (
          <div className="mb-8 flex justify-center">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-800 px-6 py-4 rounded-2xl flex items-center gap-3 shadow-lg animate-pulse">
              <div className='p-2 rounded-full bg-green-100'>
                <svg className="size-5 text-green-600" fill='currentColor' viewBox='0 0 20 20'>
            <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
          </svg>
              </div>
              <span className='font-medium'>{successMessage}</span>
            </div>
        </div>
      )}

        <Card className='p-8 bg-white/80 backdrop-blur-sm border-0 shadow-2xl rounded-2xl'>
        <Tabs defaultValue='all' className='w-full'>
            <TabsList className='mb-8 grid w-full grid-cols-3 bg-gradient-to-r from-slate-100 to-slate-200 p-1 rounded-xl h-14'>
              <TabsTrigger 
                value='all' 
                className='flex items-center justify-center gap-3 data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg px-6 py-4 h-12'
              >
                <svg className='size-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' />
                </svg>
                <span className='font-medium'>Tất cả</span>
                <span className='px-3 py-1 text-xs rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold shadow-sm'>
                  {totalNotifications}
                </span>
            </TabsTrigger>
              <TabsTrigger 
                value='unread' 
                className='flex items-center justify-center gap-3 data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg px-6 py-4 h-12'
              >
                <svg className='size-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 17h5l-5 5v-5zM4 19h6v-6H4v6zM4 5h6V1H4v4zM15 3h5v5h-5V3z' />
                </svg>
                <span className='font-medium'>Chưa đọc</span>
                <span className='px-3 py-1 text-xs rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold shadow-sm'>
                {unreadNotifications.length}
              </span>
            </TabsTrigger>
              <TabsTrigger 
                value='read' 
                className='flex items-center justify-center gap-3 data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg px-6 py-4 h-12'
              >
                <svg className='size-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                </svg>
                <span className='font-medium'>Đã đọc</span>
              </TabsTrigger>
          </TabsList>

          <TabsContent value='all'>
              <div className='space-y-4'>
                {notificationsList.length === 0 ? (
                  <div className='text-center py-16'>
                    <div className='p-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 mx-auto w-fit mb-4'>
                      <svg className='size-12 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 17h5l-5 5v-5zM4 19h6v-6H4v6zM4 5h6V1H4v4zM15 3h5v5h-5V3z' />
                      </svg>
                    </div>
                    <h3 className='text-xl font-semibold text-muted-foreground mb-2'>Chưa có thông báo nào</h3>
                    <p className='text-muted-foreground'>Các thông báo mới sẽ xuất hiện ở đây</p>
                  </div>
                ) : (
                  notificationsList.map((notification: NotificationResponse) => (
                <div
                  key={notification.id}
                      className={`${notificationItemStyle} ${notification.status === 'UNREAD' ? 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-200' : 'bg-white/50'}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                      <div className='flex items-start gap-6'>
                        <div className='flex-shrink-0 mt-1'>
                    {getNotificationIcon(notification.notificationType)}
                        </div>
                    <div className='flex-1 min-w-0'>
                      <p
                            className={`text-base mb-3 group-hover:text-primary transition-colors leading-relaxed
                            ${notification.status === 'UNREAD' ? 'font-semibold' : 'font-medium'}`}
                      >
                        {notification.content}
                      </p>
                          <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                            <div className='flex items-center gap-2'>
                              <svg className='size-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                              </svg>
                        <span>{formatDate(notification.time, true)}</span>
                            </div>
                        {notification.status === 'UNREAD' && (
                          <>
                                <span className='w-1 h-1 rounded-full bg-orange-500'></span>
                                <span className='px-3 py-1 text-xs rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold'>
                                  Chưa đọc
                                </span>
                          </>
                        )}
                      </div>
                    </div>
                    {notification.status === 'UNREAD' && (
                      <Button 
                        variant='ghost' 
                        size='sm' 
                            className='opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-green-100 hover:text-green-600 rounded-full p-2'
                        onClick={(e) => handleMarkButtonClick(e, notification)}
                      >
                            <svg className='size-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                        </svg>
                      </Button>
                    )}
                  </div>
                </div>
                  ))
                )}
            </div>
          </TabsContent>

          <TabsContent value='unread'>
              <div className='space-y-4'>
                {unreadNotifications.length === 0 ? (
                  <div className='text-center py-16'>
                    <div className='p-6 rounded-full bg-gradient-to-br from-green-100 to-emerald-200 mx-auto w-fit mb-4'>
                      <svg className='size-12 text-green-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                      </svg>
                    </div>
                    <h3 className='text-xl font-semibold text-muted-foreground mb-2'>Tất cả đã đọc!</h3>
                    <p className='text-muted-foreground'>Bạn đã đọc hết tất cả thông báo</p>
                  </div>
                ) : (
                  unreadNotifications.map((notification: NotificationResponse) => (
                <div
                  key={notification.id}
                      className={`${notificationItemStyle} bg-gradient-to-r from-orange-50 to-red-50 border-orange-200`}
                  onClick={() => handleNotificationClick(notification)}
                >
                      <div className='flex items-start gap-6'>
                        <div className='flex-shrink-0 mt-1'>
                    {getNotificationIcon(notification.notificationType)}
                        </div>
                    <div className='flex-1 min-w-0'>
                          <p className='text-base mb-3 font-semibold group-hover:text-primary transition-colors leading-relaxed'>
                        {notification.content}
                      </p>
                          <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                            <div className='flex items-center gap-2'>
                              <svg className='size-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                              </svg>
                        <span>{formatDate(notification.time, true)}</span>
                            </div>
                            <span className='w-1 h-1 rounded-full bg-orange-500'></span>
                            <span className='px-3 py-1 text-xs rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold'>
                              Chưa đọc
                            </span>
                      </div>
                    </div>
                    <Button 
                      variant='ghost' 
                      size='sm' 
                          className='opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-green-100 hover:text-green-600 rounded-full p-2'
                      onClick={(e) => handleMarkButtonClick(e, notification)}
                    >
                          <svg className='size-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                      </svg>
                    </Button>
                  </div>
                </div>
                  ))
                )}
            </div>
          </TabsContent>

          <TabsContent value='read'>
              <div className='space-y-4'>
                {readNotifications.length === 0 ? (
                  <div className='text-center py-16'>
                    <div className='p-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 mx-auto w-fit mb-4'>
                      <svg className='size-12 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                      </svg>
                    </div>
                    <h3 className='text-xl font-semibold text-muted-foreground mb-2'>Chưa có thông báo đã đọc</h3>
                    <p className='text-muted-foreground'>Các thông báo đã đọc sẽ xuất hiện ở đây</p>
                  </div>
                ) : (
                  readNotifications.map((notification: NotificationResponse) => (
                <div
                  key={notification.id}
                      className={`${notificationItemStyle} bg-white/50`}
                      onClick={() => handleNotificationClick(notification)}
                >
                      <div className='flex items-start gap-6'>
                        <div className='flex-shrink-0 mt-1'>
                    {getNotificationIcon(notification.notificationType)}
                        </div>
                    <div className='flex-1 min-w-0'>
                          <p className='text-base mb-3 font-medium group-hover:text-primary transition-colors leading-relaxed'>
                        {notification.content}
                      </p>
                          <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                            <div className='flex items-center gap-2'>
                              <svg className='size-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                              </svg>
                        <span>{formatDate(notification.time, true)}</span>
                            </div>
                            <span className='px-3 py-1 text-xs rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold'>
                              Đã đọc
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
            </div>
          </TabsContent>
        </Tabs>
      </Card>
      </div>
    </div>
  )
}
