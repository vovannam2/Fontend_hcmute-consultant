// Mock wrapper cho conversation APIs
import { ConversationQueryConfig } from '@/hooks/useConversationQueryConfig'
import { ConversationFormData, GroupConversationFormData } from '@/pages/User/Message/components/CreateNewConversation'
import { Conversation } from '@/types/conversation.type'
import { User } from '@/types/user.type'
import { PaginationResponse, SuccessResponse } from '@/types/utils.type'
import { 
  mockGetConversations,
  mockCreateUserConversation,
  mockCreateGroupConversation,
  mockDeleteConversation
} from '@/mocks/chat.mock'
import { shouldMockApi } from '@/config/mock.config'
import {
  createUserConversation as realCreateUserConversation,
  createGroupConversation as realCreateGroupConversation,
  deleteConversation as realDeleteConversation,
  getConversations as realGetConversations,
  getUsers as realGetUsers,
  addUsersToGroup as realAddUsersToGroup,
  getMembers as realGetMembers,
  updateConversation as realUpdateConversation,
  removeMember as realRemoveMember
} from './conversation.api'

// Mock wrapper cho getConversations
export const getConversations = (params: ConversationQueryConfig) => {
  if (shouldMockApi('CONVERSATIONS')) {
    return mockGetConversations(params)
  }
  return realGetConversations(params)
}

// Mock wrapper cho createUserConversation
export const createUserConversation = (body: ConversationFormData) => {
  if (shouldMockApi('CREATE_CONVERSATION')) {
    return mockCreateUserConversation(body)
  }
  return realCreateUserConversation(body)
}

// Mock wrapper cho createGroupConversation
export const createGroupConversation = (body: GroupConversationFormData) => {
  if (shouldMockApi('CREATE_CONVERSATION')) {
    return mockCreateGroupConversation(body)
  }
  return realCreateGroupConversation(body)
}

// Mock wrapper cho deleteConversation
export const deleteConversation = (conversationId: number) => {
  if (shouldMockApi('DELETE_CONVERSATION')) {
    return mockDeleteConversation(conversationId)
  }
  return realDeleteConversation(conversationId)
}

// Các API khác vẫn sử dụng real API
export const getUsers = realGetUsers
export const addUsersToGroup = realAddUsersToGroup
export const getMembers = realGetMembers
export const updateConversation = realUpdateConversation
export const removeMember = realRemoveMember
