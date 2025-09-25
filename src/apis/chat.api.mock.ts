// Mock wrapper cho chat APIs
import { ChatHistoryConfig } from '@/types/params.type'
import { PaginationResponse, SuccessResponse } from '@/types/utils.type'
import { Chat } from '@/types/chat.type'
import { shouldMockApi } from '@/config/mock.config'
import { mockGetChatHistory } from '@/mocks/chat.mock'
import { 
  getChatHistory as realGetChatHistory,
  updateMessage as realUpdateMessage,
  recallMessage as realRecallMessage,
  recallMessageAll as realRecallMessageAll
} from './chat.api'

// Mock wrapper cho getChatHistory
export const getChatHistory = (params: ChatHistoryConfig) => {
  if (shouldMockApi('CHAT_HISTORY')) {
    return mockGetChatHistory(params)
  }
  return realGetChatHistory(params)
}

// Mock wrapper cho updateMessage
export const updateMessage = (messageId: number, newContent: string) => {
  if (shouldMockApi('UPDATE_MESSAGE')) {
    return new Promise<SuccessResponse<string>>((resolve) => {
      setTimeout(() => {
        resolve({
          data: 'Cập nhật tin nhắn thành công',
          message: 'Success',
          status: 'success'
        })
      }, 500)
    })
  }
  return realUpdateMessage(messageId, newContent)
}

// Mock wrapper cho recallMessage
export const recallMessage = (messageId: number) => {
  if (shouldMockApi('UPDATE_MESSAGE')) {
    return new Promise<SuccessResponse<string>>((resolve) => {
      setTimeout(() => {
        resolve({
          data: 'Thu hồi tin nhắn thành công',
          message: 'Success',
          status: 'success'
        })
      }, 500)
    })
  }
  return realRecallMessage(messageId)
}

// Mock wrapper cho recallMessageAll
export const recallMessageAll = (messageId: number) => {
  if (shouldMockApi('UPDATE_MESSAGE')) {
    return new Promise<SuccessResponse<string>>((resolve) => {
      setTimeout(() => {
        resolve({
          data: 'Thu hồi tin nhắn cho tất cả thành công',
          message: 'Success',
          status: 'success'
        })
      }, 500)
    })
  }
  return realRecallMessageAll(messageId)
}
