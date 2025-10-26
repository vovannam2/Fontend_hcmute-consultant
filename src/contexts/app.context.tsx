import { User, UserOnline } from '@/types/user.type'
import { NotificationResponse } from '@/types/notification.type'
import {
  getAccessTokenFromLocalStorage,
  getOnlineUsersFromLocalStorate,
  getRoleFromLocalStorage,
  getUserFromLocalStorate
} from '@/utils/auth'
import { createContext, useState, useEffect } from 'react'
import useUnreadConversationCount from '@/hooks/useUnreadConversationCount'
import socketService from '@/services/socketService'
import { useQueryClient } from '@tanstack/react-query'

interface AppContextInterface {
  isAuthenticated: boolean
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>
  user: User | null
  setUser: React.Dispatch<React.SetStateAction<User | null>>
  reset: () => void
  role: string
  setRole: React.Dispatch<React.SetStateAction<string>>
  onlineUsers: UserOnline[] | null
  setOnlineUsers: React.Dispatch<React.SetStateAction<UserOnline[] | null>>
  unreadConversationCount: number
  setUnreadConversationCount: React.Dispatch<React.SetStateAction<number>>
  unreadNotificationCount: number
  setUnreadNotificationCount: React.Dispatch<React.SetStateAction<number>>
}

const initialAppContext: AppContextInterface = {
  isAuthenticated: Boolean(getAccessTokenFromLocalStorage()),
  setIsAuthenticated: () => null,
  user: getUserFromLocalStorate(),
  setUser: () => null,
  reset: () => null,
  role: getRoleFromLocalStorage(),
  setRole: () => null,
  onlineUsers: getOnlineUsersFromLocalStorate(),
  setOnlineUsers: () => null,
  unreadConversationCount: 0,
  setUnreadConversationCount: () => null,
  unreadNotificationCount: 0,
  setUnreadNotificationCount: () => null
}

export const AppContext = createContext<AppContextInterface>(initialAppContext)

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(initialAppContext.isAuthenticated)
  const [user, setUser] = useState<User | null>(initialAppContext.user)
  const [onlineUsers, setOnlineUsers] = useState<UserOnline[] | null>(initialAppContext.onlineUsers ?? [])
  const [role, setRole] = useState<string>(initialAppContext.role)
  const [unreadConversationCount, setUnreadConversationCount] = useState<number>(0)
  const [unreadNotificationCount, setUnreadNotificationCount] = useState<number>(0)
  const queryClient = useQueryClient()

  // Debug khi context count thay đổi
  useEffect(() => {
  }, [unreadConversationCount])

  // Fetch unread conversation count when authenticated
  const { unreadCount } = useUnreadConversationCount()
  
  // Sync unreadCount from hook to context state
  useEffect(() => {
    setUnreadConversationCount(unreadCount)
  }, [unreadCount])

  // Setup socket connection for real-time updates
  useEffect(() => {
    if (isAuthenticated && user) {
      const token = getAccessTokenFromLocalStorage()
      if (token) {
        socketService.connect(
          user.id.toString(),
          token,
          (count: number) => {
            setUnreadConversationCount(count)
          },
          (notification: NotificationResponse) => {
            
            // Invalidate notifications query to refresh the list
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
            // Invalidate unread count query
            queryClient.invalidateQueries({ queryKey: ['unread-count'] })
            
            // Update unread count
            setUnreadNotificationCount(prev => {
              const newCount = prev + 1
              return newCount
            })
          }
        )

        // Listen for online users list updates
        socketService.on('onlineUsersList', (userIds: string[]) => {
          // Update online users state with the list of user IDs
          // Note: The backend sends only IDs, but we need to fetch full user details
          // For now, we'll just store the IDs and the component will handle fetching details
          // In a real scenario, you'd want to fetch user details for these IDs
          setOnlineUsers(userIds as any)
        })

        // Listen for user status changes
        socketService.on('userStatusChanged', (data: { userId: string; status: string }) => {
          // You can update the online users list here if needed
        })
      }
    } else {
      socketService.disconnect()
    }

    return () => {
      socketService.disconnect()
    }
  }, [isAuthenticated, user, queryClient])

  const reset = () => {
    setIsAuthenticated(false)
    setUser(null)
    setUnreadConversationCount(0)
    setUnreadNotificationCount(0)
    socketService.disconnect()
  }

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        user,
        setUser,
        reset,
        role,
        setRole,
        onlineUsers,
        setOnlineUsers,
        unreadConversationCount,
        setUnreadConversationCount,
        unreadNotificationCount,
        setUnreadNotificationCount
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
