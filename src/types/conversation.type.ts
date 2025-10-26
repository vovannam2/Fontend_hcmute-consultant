export interface MemberConversation {
  id: string
  name: string
  avatarUrl: string
  sender: boolean
}

export interface UserInfo {
  id: string
  email: string
  fullName: string
  avatarUrl?: string
}

export interface Conversation {
  id: string
  name: string
  user: UserInfo
  consultant: UserInfo
  department: {
    id: string
    name: string
  }
  statusActive: boolean
  members: Array<{
    user: UserInfo
    _id: string
    joinedAt: string
    id: string
  }>
  deletedBy: any[]
  createdAt: string
  updatedAt: string
  isGroup?: boolean // Optional for backward compatibility
}
