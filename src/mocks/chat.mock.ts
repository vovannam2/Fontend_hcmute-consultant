// Mock data cho hệ thống chat
import { Conversation } from '@/types/conversation.type'
import { Chat } from '@/types/chat.type'
import { PaginationResponse, SuccessResponse } from '@/types/utils.type'

// Mock data cho danh sách cuộc trò chuyện
export const mockConversations: Conversation[] = [
  {
    id: 1,
    department: {
      id: 1,
      name: 'Khoa Công nghệ thông tin'
    },
    name: 'Tư vấn về React',
    isGroup: false,
    createdAt: '2024-01-15T10:30:00Z',
    members: [
      {
        id: 1,
        name: 'Nguyễn Văn A',
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        sender: true
      },
      {
        id: 2,
        name: 'Thầy Minh',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        sender: false
      }
    ]
  },
  {
    id: 2,
    department: {
      id: 1,
      name: 'Khoa Công nghệ thông tin'
    },
    name: 'Nhóm tư vấn Frontend',
    isGroup: true,
    createdAt: '2024-01-14T14:20:00Z',
    members: [
      {
        id: 1,
        name: 'Nguyễn Văn A',
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        sender: true
      },
      {
        id: 2,
        name: 'Thầy Minh',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        sender: false
      },
      {
        id: 3,
        name: 'Cô Lan',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
        sender: false
      }
    ]
  },
  {
    id: 3,
    department: {
      id: 2,
      name: 'Khoa Điện tử'
    },
    name: 'Tư vấn về Arduino',
    isGroup: false,
    createdAt: '2024-01-13T09:15:00Z',
    members: [
      {
        id: 1,
        name: 'Nguyễn Văn A',
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        sender: true
      },
      {
        id: 4,
        name: 'Thầy Hùng',
        avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face',
        sender: false
      }
    ]
  },
  {
    id: 4,
    department: {
      id: 1,
      name: 'Khoa Công nghệ thông tin'
    },
    name: 'Hỏi về đồ án',
    isGroup: false,
    createdAt: '2024-01-12T16:45:00Z',
    members: [
      {
        id: 1,
        name: 'Nguyễn Văn A',
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        sender: true
      },
      {
        id: 5,
        name: 'Cô Mai',
        avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
        sender: false
      }
    ]
  }
]

// Mock data cho lịch sử chat của cuộc trò chuyện 1
export const mockChatHistory1: Chat[] = [
  {
    id: 1,
    conversationId: 1,
    date: '2024-01-15T10:30:00Z',
    message: 'Chào thầy, em có câu hỏi về React hooks',
    imageUrl: '',
    messageStatus: null,
    sender: {
      id: 1,
      name: 'Nguyễn Văn A',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    },
    receiver: [
      {
        id: 2,
        name: 'Thầy Minh',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
      }
    ],
    recalledBySender: false,
    recalledForEveryone: false,
    edited: false,
    editedDate: ''
  },
  {
    id: 2,
    conversationId: 1,
    date: '2024-01-15T10:32:00Z',
    message: 'Chào em! Thầy sẵn sàng giúp em. Em có thể hỏi cụ thể về hook nào không?',
    imageUrl: '',
    messageStatus: null,
    sender: {
      id: 2,
      name: 'Thầy Minh',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
    },
    receiver: [
      {
        id: 1,
        name: 'Nguyễn Văn A',
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
      }
    ],
    recalledBySender: false,
    recalledForEveryone: false,
    edited: false,
    editedDate: ''
  },
  {
    id: 3,
    conversationId: 1,
    date: '2024-01-15T10:35:00Z',
    message: 'Em muốn hiểu về useEffect hook ạ. Em thấy nó khá phức tạp',
    imageUrl: '',
    messageStatus: null,
    sender: {
      id: 1,
      name: 'Nguyễn Văn A',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    },
    receiver: [
      {
        id: 2,
        name: 'Thầy Minh',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
      }
    ],
    recalledBySender: false,
    recalledForEveryone: false,
    edited: false,
    editedDate: ''
  },
  {
    id: 4,
    conversationId: 1,
    date: '2024-01-15T10:40:00Z',
    message: 'useEffect là một hook rất quan trọng trong React. Nó cho phép bạn thực hiện side effects trong functional components. Có 3 trường hợp sử dụng chính:\n\n1. useEffect(() => {}) - Chạy sau mỗi lần render\n2. useEffect(() => {}, []) - Chỉ chạy một lần sau khi component mount\n3. useEffect(() => {}, [dependency]) - Chạy khi dependency thay đổi',
    imageUrl: '',
    messageStatus: null,
    sender: {
      id: 2,
      name: 'Thầy Minh',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
    },
    receiver: [
      {
        id: 1,
        name: 'Nguyễn Văn A',
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
      }
    ],
    recalledBySender: false,
    recalledForEveryone: false,
    edited: false,
    editedDate: ''
  },
  {
    id: 5,
    conversationId: 1,
    date: '2024-01-15T10:45:00Z',
    message: 'Cảm ơn thầy! Em hiểu rồi ạ. Em sẽ thực hành thêm',
    imageUrl: '',
    messageStatus: null,
    sender: {
      id: 1,
      name: 'Nguyễn Văn A',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    },
    receiver: [
      {
        id: 2,
        name: 'Thầy Minh',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
      }
    ],
    recalledBySender: false,
    recalledForEveryone: false,
    edited: false,
    editedDate: ''
  }
]

// Mock data cho lịch sử chat của cuộc trò chuyện 2 (nhóm)
export const mockChatHistory2: Chat[] = [
  {
    id: 6,
    conversationId: 2,
    date: '2024-01-14T14:20:00Z',
    message: 'Chào mọi người! Hôm nay chúng ta sẽ thảo luận về React hooks',
    imageUrl: '',
    messageStatus: null,
    sender: {
      id: 2,
      name: 'Thầy Minh',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
    },
    receiver: [
      {
        id: 1,
        name: 'Nguyễn Văn A',
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
      },
      {
        id: 3,
        name: 'Cô Lan',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face'
      }
    ],
    recalledBySender: false,
    recalledForEveryone: false,
    edited: false,
    editedDate: ''
  },
  {
    id: 7,
    conversationId: 2,
    date: '2024-01-14T14:25:00Z',
    message: 'Em có câu hỏi về useState hook ạ',
    imageUrl: '',
    messageStatus: null,
    sender: {
      id: 1,
      name: 'Nguyễn Văn A',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    },
    receiver: [
      {
        id: 2,
        name: 'Thầy Minh',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
      },
      {
        id: 3,
        name: 'Cô Lan',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face'
      }
    ],
    recalledBySender: false,
    recalledForEveryone: false,
    edited: false,
    editedDate: ''
  },
  {
    id: 8,
    conversationId: 2,
    date: '2024-01-14T14:30:00Z',
    message: 'useState là hook cơ bản nhất để quản lý state trong functional component. Bạn có thể sử dụng như sau:\n\nconst [count, setCount] = useState(0)',
    imageUrl: '',
    messageStatus: null,
    sender: {
      id: 3,
      name: 'Cô Lan',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face'
    },
    receiver: [
      {
        id: 1,
        name: 'Nguyễn Văn A',
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
      },
      {
        id: 2,
        name: 'Thầy Minh',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
      }
    ],
    recalledBySender: false,
    recalledForEveryone: false,
    edited: false,
    editedDate: ''
  }
]

// Mock data cho lịch sử chat của cuộc trò chuyện 3
export const mockChatHistory3: Chat[] = [
  {
    id: 9,
    conversationId: 3,
    date: '2024-01-13T09:15:00Z',
    message: 'Chào thầy, em muốn hỏi về Arduino',
    imageUrl: '',
    messageStatus: null,
    sender: {
      id: 1,
      name: 'Nguyễn Văn A',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    },
    receiver: [
      {
        id: 4,
        name: 'Thầy Hùng',
        avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face'
      }
    ],
    recalledBySender: false,
    recalledForEveryone: false,
    edited: false,
    editedDate: ''
  },
  {
    id: 10,
    conversationId: 3,
    date: '2024-01-13T09:20:00Z',
    message: 'Chào em! Thầy sẵn sàng giúp em về Arduino. Em có câu hỏi gì cụ thể không?',
    imageUrl: '',
    messageStatus: null,
    sender: {
      id: 4,
      name: 'Thầy Hùng',
      avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face'
    },
    receiver: [
      {
        id: 1,
        name: 'Nguyễn Văn A',
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
      }
    ],
    recalledBySender: false,
    recalledForEveryone: false,
    edited: false,
    editedDate: ''
  }
]

// Mock data cho lịch sử chat của cuộc trò chuyện 4
export const mockChatHistory4: Chat[] = [
  {
    id: 11,
    conversationId: 4,
    date: '2024-01-12T16:45:00Z',
    message: 'Chào cô, em có thắc mắc về đồ án tốt nghiệp',
    imageUrl: '',
    messageStatus: null,
    sender: {
      id: 1,
      name: 'Nguyễn Văn A',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    },
    receiver: [
      {
        id: 5,
        name: 'Cô Mai',
        avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
      }
    ],
    recalledBySender: false,
    recalledForEveryone: false,
    edited: false,
    editedDate: ''
  },
  {
    id: 12,
    conversationId: 4,
    date: '2024-01-12T16:50:00Z',
    message: 'Chào em! Cô sẵn sàng hướng dẫn em về đồ án. Em có thể chia sẻ đề tài em đang làm không?',
    imageUrl: '',
    messageStatus: null,
    sender: {
      id: 5,
      name: 'Cô Mai',
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
    },
    receiver: [
      {
        id: 1,
        name: 'Nguyễn Văn A',
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
      }
    ],
    recalledBySender: false,
    recalledForEveryone: false,
    edited: false,
    editedDate: ''
  }
]

// Hàm tạo response mock
export const createMockResponse = <T>(data: T): SuccessResponse<T> => ({
  data,
  message: 'Success',
  status: 'success'
})

// Hàm tạo pagination response mock
export const createMockPaginationResponse = <T>(content: T[]): SuccessResponse<PaginationResponse<T[]>> => ({
  data: {
    content,
    size: 20,
    totalElements: content.length,
    totalPages: 1
  },
  message: 'Success',
  status: 'success'
})

// Mock API functions
export const mockGetConversations = (params: any) => {
  console.log('Mock API: getConversations called with params:', params)
  
  // Simulate delay
  return new Promise<SuccessResponse<PaginationResponse<Conversation[]>>>((resolve) => {
    setTimeout(() => {
      resolve(createMockPaginationResponse(mockConversations))
    }, 500)
  })
}

export const mockGetChatHistory = (params: any) => {
  console.log('Mock API: getChatHistory called with params:', params)
  
  const conversationId = params.conversationId
  let chatHistory: Chat[] = []
  
  switch (conversationId) {
    case 1:
      chatHistory = mockChatHistory1
      break
    case 2:
      chatHistory = mockChatHistory2
      break
    case 3:
      chatHistory = mockChatHistory3
      break
    case 4:
      chatHistory = mockChatHistory4
      break
    default:
      chatHistory = []
  }
  
  return new Promise<SuccessResponse<PaginationResponse<Chat[]>>>((resolve) => {
    setTimeout(() => {
      resolve(createMockPaginationResponse(chatHistory))
    }, 300)
  })
}

export const mockCreateUserConversation = (body: any) => {
  console.log('Mock API: createUserConversation called with body:', body)
  
  return new Promise<SuccessResponse<Conversation>>((resolve) => {
    setTimeout(() => {
      const newConversation: Conversation = {
        id: Date.now(),
        department: {
          id: 1,
          name: 'Khoa Công nghệ thông tin'
        },
        name: 'Cuộc trò chuyện mới',
        isGroup: false,
        createdAt: new Date().toISOString(),
        members: [
          {
            id: 1,
            name: 'Nguyễn Văn A',
            avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
            sender: true
          },
          {
            id: 6,
            name: 'Tư vấn viên mới',
            avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
            sender: false
          }
        ]
      }
      resolve(createMockResponse(newConversation))
    }, 800)
  })
}

export const mockCreateGroupConversation = (body: any) => {
  console.log('Mock API: createGroupConversation called with body:', body)
  
  return new Promise<SuccessResponse<string>>((resolve) => {
    setTimeout(() => {
      resolve(createMockResponse('Tạo nhóm thành công'))
    }, 800)
  })
}

export const mockUpdateMessage = (messageId: number, newContent: string) => {
  console.log('Mock API: updateMessage called with:', { messageId, newContent })
  
  return new Promise<SuccessResponse<string>>((resolve) => {
    setTimeout(() => {
      resolve(createMockResponse('Cập nhật tin nhắn thành công'))
    }, 500)
  })
}

export const mockDeleteConversation = (conversationId: number) => {
  console.log('Mock API: deleteConversation called with conversationId:', conversationId)
  
  return new Promise<SuccessResponse<string>>((resolve) => {
    setTimeout(() => {
      resolve(createMockResponse('Xóa cuộc trò chuyện thành công'))
    }, 500)
  })
}
