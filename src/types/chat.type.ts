export interface Chat {
  conversationId: string
  date: string
  id: number
  message: string
  imageUrl: string
  fileUrl?: string
  messageStatus: null

  receiver: {
    id: string
    name: string
    avatarUrl: string
  }[]
  sender: {
    id: string
    name: string
    avatarUrl: string
  }
  recalledBySender: boolean | null
  recalledForEveryone: boolean | null
  edited: boolean | null
  editedDate: string
}
