import { io, Socket } from 'socket.io-client'

class SocketService {
  private socket: Socket | null = null
  private serverUrl: string

  constructor() {
    this.serverUrl = import.meta.env.VITE_SERVER_URL || import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'
  }

  // Kết nối socket
  connect(userId: string, token: string, onUnreadCountUpdate?: (count: number) => void, onNotificationUpdate?: (notification: any) => void) {
    
    // Disconnect existing socket if any
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }

    // Kiểm tra token trước khi kết nối
    if (!token) {
      console.error('❌ Cannot connect socket: No authentication token provided')
      return
    }

    this.socket = io(this.serverUrl, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    })

    // Debug events
    this.socket.on('connect', () => {
    })

    this.socket.on('disconnect', (reason) => {
    })

    this.socket.on('connect_error', (error) => {
      console.error(`❌ Socket connection error:`, error)
      console.error(`❌ Error details:`, {
        message: error.message,
        description: (error as any).description,
        context: (error as any).context,
        type: (error as any).type
      })
      
      // Xử lý các lỗi cụ thể
      if (error.message.includes('Authentication error')) {
        console.error('🔐 Authentication failed - token may be invalid or expired')
        // Có thể dispatch event để logout user
        window.dispatchEvent(new CustomEvent('socket-auth-error'))
      }
    })

    this.socket.on('reconnect', (attemptNumber) => {
    })

    this.socket.on('reconnect_error', (error) => {
      console.error(`❌ Socket reconnection error:`, error)
    })

    this.socket.on('reconnect_failed', () => {
      console.error(`❌ Socket reconnection failed after all attempts`)
    })

    this.socket.on('userStatusChanged', (data) => {
    })

    this.socket.on('onlineUsersList', (users) => {
    })

    // Lắng nghe cập nhật số lượng hội thoại chưa đọc
    this.socket.on('unreadConversationCount', (count: number) => {
      if (onUnreadCountUpdate) {
        onUnreadCountUpdate(count)
      }
    })

    // Lắng nghe thông báo mới
    this.socket.on('newNotification', (notification: any) => {
      if (onNotificationUpdate) {
        onNotificationUpdate(notification)
      } else {
      }
    })

    // Báo user online
    this.socket.emit('userOnline', userId)
    
    // Join notification room
    this.socket.emit('joinNotificationRoom', userId)

    return this.socket
  }

  // Ngắt kết nối
  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  // Join conversation
  joinConversation(conversationId: string) {
    if (this.socket) {
      this.socket.emit('joinConversation', conversationId)
    }
  }

  // Gửi tin nhắn
  sendMessage(data: {
    conversationId: string
    message: string
    imageUrl?: string
    fileUrl?: string
  }) {
    if (this.socket) {
      this.socket.emit('sendMessage', data, (response: any) => {
      })
    } else {
    }
  }

  // Cập nhật tin nhắn
  updateMessage(messageId: number, message: string) {
    if (this.socket) {
      this.socket.emit('updateMessage', { messageId, message })
    }
  }

  // Xóa tin nhắn
  deleteMessage(messageId: number) {
    if (this.socket) {
      this.socket.emit('deleteMessage', { messageId })
    }
  }

  // Lắng nghe sự kiện
  on(event: string, callback: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.on(event, callback)
    }
  }

  // Hủy lắng nghe sự kiện
  off(event: string, callback?: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.off(event, callback)
    }
  }

  // Kiểm tra trạng thái kết nối
  get isConnected() {
    return this.socket?.connected || false
  }

  // Lấy socket instance
  get socketInstance() {
    return this.socket
  }

  // Kiểm tra token có hợp lệ không
  checkTokenValidity(token: string): boolean {
    if (!token) return false
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const now = Math.floor(Date.now() / 1000)
      return payload.exp > now
    } catch (error) {
      console.error('❌ Error checking token validity:', error)
      return false
    }
  }

  // Lấy token từ localStorage
  getStoredToken(): string | null {
    return localStorage.getItem('accessToken')
  }
}

export default new SocketService()
