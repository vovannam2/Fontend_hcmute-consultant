import { useQuery } from '@tanstack/react-query'
import { getUnreadConversationCount } from '@/apis/conversation.api'
import { useContext, useEffect } from 'react'
import { AppContext } from '@/contexts/app.context'

export default function useUnreadConversationCount() {
  const { isAuthenticated } = useContext(AppContext)

  const { data, refetch, error } = useQuery({
    queryKey: ['unreadConversationCount'],
    queryFn: getUnreadConversationCount,
    select: (res) => res.data.data, // map to number
    enabled: isAuthenticated,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true
  })

  useEffect(() => {
    if (error) {
      console.error('❌ Error fetching unread count:', error)
    }
  }, [error])

  return {
    unreadCount: data ?? 0,
    refetch
  }
}
