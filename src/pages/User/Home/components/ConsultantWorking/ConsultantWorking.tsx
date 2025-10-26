import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AppContext } from '@/contexts/app.context'
import { useContext, useEffect, useState } from 'react'
import { MessageCircle, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import path from '@/constants/path'
import socketService from '@/services/socketService'
import { getOnlineConsultants } from '@/apis/consultant.api'
import { User } from '@/types/user.type'

interface OnlineUser {
  id: string
  fullName: string
  username?: string
  avatarUrl: string
  role?: string
}

export default function ConsultantWorking() {
  const { isAuthenticated, user } = useContext(AppContext)
  const [onlineConsultants, setOnlineConsultants] = useState<OnlineUser[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch online consultants from API
  const fetchOnlineConsultants = async () => {
    if (!isAuthenticated) {
      return
    }
    
    setLoading(true)
    try {
      const response = await getOnlineConsultants()
      
      // Handle different response structures
      let consultants: any[] = []
      if (Array.isArray(response.data)) {
        consultants = response.data
      } else if (response.data && typeof response.data === 'object') {
        // Try to find array in the nested object
        const data = response.data as any
        if (Array.isArray(data.data)) {
          consultants = data.data
        } else if (Array.isArray(data.list)) {
          consultants = data.list
        } else if (Array.isArray(data.items)) {
          consultants = data.items
        }
      }
      
      setOnlineConsultants(consultants)
    } catch (error) {
      console.error('❌ Error fetching online consultants:', error)
      setOnlineConsultants([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    
    if (!isAuthenticated || !user) {
      return
    }

    
    // Initial fetch
    fetchOnlineConsultants()

    // Listen for user status changes to refresh the list
    const handleUserStatusChange = (data: { userId: string; status: string }) => {
      // Refresh the list when user status changes
      fetchOnlineConsultants()
    }

    // Register event listeners
    socketService.on('userStatusChanged', handleUserStatusChange)

    // Set up periodic refresh (every 30 seconds)
    const intervalId = setInterval(() => {
      fetchOnlineConsultants()
    }, 30000)

    return () => {
      // Cleanup listeners and interval
      socketService.off('userStatusChanged', handleUserStatusChange)
      clearInterval(intervalId)
    }
  }, [isAuthenticated, user])

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Users className="w-4 h-4" />
          Tư vấn viên đang online
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {loading ? (
          <div className='flex flex-col items-center justify-center text-muted-foreground py-6'>
            <Users className="w-8 h-8 mb-2 opacity-50 animate-pulse" />
            <p className='text-center text-sm'>Đang tải...</p>
          </div>
        ) : onlineConsultants && onlineConsultants.length > 0 ? (
          <div className="space-y-2">
            {onlineConsultants.map((consultant) => (
              <Link
                key={consultant.id}
                to={`${path.messages}?userId=${consultant.id}`}
                className='flex items-center gap-3 p-2 hover:bg-accent rounded-md cursor-pointer transition-colors'
              >
                <div className="relative">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={consultant.avatarUrl} />
                    <AvatarFallback className="text-xs">
                      {consultant.fullName?.split(' ').map(n => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <Badge className="absolute -bottom-1 -right-1 w-3 h-3 p-0 bg-green-500 border-2 border-background" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className='font-medium text-sm truncate'>{consultant.fullName || consultant.username}</p>
                  <p className="text-xs text-muted-foreground">Đang online</p>
                </div>
                <MessageCircle className="w-4 h-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center text-muted-foreground py-6'>
            <Users className="w-8 h-8 mb-2 opacity-50" />
            <p className='text-center text-sm'>Không có tư vấn viên nào đang online</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
