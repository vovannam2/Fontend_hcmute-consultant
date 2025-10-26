export interface NotificationSocket {
  status: string
  data: {
    senderId: string
    content: string
    time: string
    notificationType: string
    status: string
  }
}

export interface NotificationResponse {
  id: string
  senderId: {
    id: string
    username: string
    avatarUrl?: string
    fullName: string
  } | null
  receiverId: {
    id: string
    username: string
    fullName: string
  }
  content: string
  time: string
  notificationType: string
  status: 'READ' | 'UNREAD'
  questionId?: string
  answerId?: string
  createdAt?: string
  updatedAt?: string
}

export interface NotificationPageResponse {
  content: NotificationResponse[]
  pageable: {
    sort: {
      empty: boolean
      sorted: boolean
      unsorted: boolean
    }
    offset: number
    pageNumber: number
    pageSize: number
    paged: boolean
    unpaged: boolean
  }
  last: boolean
  totalElements: number
  totalPages: number
  first: boolean
  numberOfElements: number
  size: number
  number: number
  sort: {
    empty: boolean
    sorted: boolean
    unsorted: boolean
  }
  empty: boolean
}
