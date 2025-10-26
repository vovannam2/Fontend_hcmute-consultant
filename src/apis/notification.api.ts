import { NotificationPageResponse, NotificationResponse } from '@/types/notification.type'
import { SuccessResponse } from '@/types/utils.type'
import http from '@/utils/http'

export const getNotifications = () => http.get<SuccessResponse<NotificationPageResponse>>('notifications')

export const getUnreadCount = () => http.get<SuccessResponse<{ count: number }>>('notifications/unread-count')

export const markAsRead = (id: string) => http.post<SuccessResponse<void>>('notifications/read', null, {
  params: { id }
})

export const markAllAsRead = () => http.post<SuccessResponse<void>>('notifications/read-all', null)

export const getNotificationDetail = (id: string) => http.get<SuccessResponse<NotificationResponse>>('notifications/detail', {
  params: { id }
})

export const deleteAllNotifications = () => http.post<SuccessResponse<void>>('notifications/delete-all', null)

export const deleteNotification = (id: string) => http.post<SuccessResponse<void>>('notifications/delete', null, {
  params: { id }
})
