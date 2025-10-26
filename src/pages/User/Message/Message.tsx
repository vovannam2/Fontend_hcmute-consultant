import React from 'react'
import { getConversations } from '@/apis/conversation.api.ts'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import path from '@/constants/path'
import useConversationQueryConfig from '@/hooks/useConversationQueryConfig.tsx'
import useQueryParams from '@/hooks/useQueryParams'
import { Conversation } from '@/types/conversation.type'
import { MagnifyingGlassIcon } from '@radix-ui/react-icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  MessageCircleIcon, 
  Plus, 
  MoreHorizontal, 
  Trash2, 
  Send, 
  CheckCircle2Icon, 
  X, 
  Phone, 
  Video, 
  Info, 
  Smile, 
  Paperclip,
  Check,
  CheckCheck,
  MoreVertical
} from 'lucide-react'
import { useEffect, useState, useContext } from 'react'
import { createSearchParams, useNavigate } from 'react-router-dom'
import { AppContext } from '@/contexts/app.context'
import { ROLE } from '@/constants/role'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { getConsultantsByDepartment } from '@/apis/consultant.api'
import { getAllDepartments } from '@/apis/department.api'
import { createUserConversation, createGroupConversation, deleteConversation, markConversationAsRead } from '@/apis/conversation.api'
import { getChatHistory, updateMessage } from '@/apis/chat.api'
import { ChatHistoryConfig } from '@/types/params.type'
import { Chat as ChatType } from '@/types/chat.type'
import { Consultant } from '@/types/consultant.type'
import { FormControlItem } from '@/types/utils.type'
import { generateSelectionData } from '@/utils/utils'
import { CreateConversationSchema, CreateGroupConversationSchema } from '@/utils/rules'
import { formatDate } from '@/utils/utils'
import { getUserFromLocalStorate } from '@/utils/auth'
import socketService from '@/services/socketService'
import { uploadFile } from '@/apis/file.api'
import useUnreadConversationCount from '@/hooks/useUnreadConversationCount'

// Types for form data
export type ConversationFormData = yup.InferType<typeof CreateConversationSchema>
export type GroupConversationFormData = yup.InferType<typeof CreateGroupConversationSchema>

// Avatar Component with Facebook Messenger style
function AvatarCustom({ url, fallback = 'USER', isOnline = false, className = 'size-9', showOnlineStatus = true }: {
  readonly url: string | undefined
  readonly fallback?: string
  readonly isOnline?: boolean
  readonly className?: string
  readonly showOnlineStatus?: boolean
}) {
  return (
    <div className='relative'>
      <Avatar className={`${className} ring-2 ring-background shadow-sm`}>
        <AvatarImage src={url} alt='avatar' className='object-cover' />
        <AvatarFallback className='text-xs font-medium bg-gradient-to-br from-blue-500 to-purple-600 text-white'>
          {fallback}
        </AvatarFallback>
      </Avatar>
      {showOnlineStatus && isOnline && (
        <div className='absolute -bottom-0.5 -right-0.5 size-3 bg-green-500 rounded-full border-2 border-background shadow-sm' />
      )}
    </div>
  )
}

// Create New Conversation Component
function CreateNewConversation({ conversationQueryParams }: {
  readonly conversationQueryParams: any
}) {
  const { role } = useContext(AppContext)
  const queryClient = useQueryClient()
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false)

  const createConversationForm = useForm<ConversationFormData>({
    defaultValues: {
      consultantId: '',
      departmentId: ''
    },
    resolver: yupResolver(CreateConversationSchema)
  })

  const createGroupConversationForm = useForm<GroupConversationFormData>({
    defaultValues: {
      name: ''
    },
    resolver: yupResolver(CreateGroupConversationSchema)
  })

  const createConversationMutation = useMutation({
    mutationFn: (body: ConversationFormData) => createUserConversation(body)
  })

  const createGroupConversationMutation = useMutation({
    mutationFn: (body: GroupConversationFormData) => createGroupConversation(body)
  })

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: getAllDepartments
  })

  const departmentsSelectionData: FormControlItem[] | undefined = React.useMemo(() => {
    const data = departments?.data.data
    return generateSelectionData(data)
  }, [departments])

  const departmentId = createConversationForm.watch('departmentId')
  const { data: consultants } = useQuery({
    queryKey: ['consultantsByDepartment', departmentId],
    queryFn: () => getConsultantsByDepartment(departmentId),
    enabled: !!departmentId
  })

  const consultantsSelectionData: FormControlItem[] | undefined = React.useMemo(() => {
    const data = consultants?.data.data
    return data?.map((consultant: Consultant) => {
      return {
        value: String(consultant.id),
        label: consultant.fullName
      }
    })
  }, [consultants])

  const onUserSubmit = createConversationForm.handleSubmit((values) => {
    createConversationMutation.mutate(values, {
      onSuccess: (res) => {
        toast.success(res.data.message)
        setIsOpenModal(false)
        queryClient.invalidateQueries({
          queryKey: ['conversations', conversationQueryParams]
        })
      }
    })
  })

  const onConsultantSubmit = createGroupConversationForm.handleSubmit((values) =>
    createGroupConversationMutation.mutate(values, {
      onSuccess: (res) => {
        toast.success(res.data.message)
        setIsOpenModal(false)
        queryClient.invalidateQueries({
          queryKey: ['conversations', conversationQueryParams]
        })
      }
    })
  )

  return (
    <Dialog open={isOpenModal} onOpenChange={setIsOpenModal}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="ml-2">
          <Plus className="size-5" />
        </Button>
      </DialogTrigger>
      <DialogContent 
        className="sm:max-w-md overflow-visible"
        style={{ zIndex: 50 }}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-center pb-4">
          <DialogTitle className="text-xl font-semibold text-gray-800">
            Tạo đoạn chat mới
          </DialogTitle>
        </DialogHeader>
        {role === ROLE.user && (
          <Form {...createConversationForm}>
            <form onSubmit={onUserSubmit}>
              <div className='mb-4'>
                <FormField
                  control={createConversationForm.control}
                  name='departmentId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chọn phòng ban</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Chọn phòng ban' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent
                          position="popper"
                          side="bottom"
                          align="start"
                          sideOffset={4}
                          avoidCollisions={true}
                          collisionPadding={16}
                          style={{ zIndex: 999999 }}
                          className="bg-white border shadow-xl max-h-48"
                          onCloseAutoFocus={(e) => e.preventDefault()}
                        >
                          {departmentsSelectionData?.map((item) => (
                            <SelectItem key={item.value} value={String(item.value)}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className='mb-4'>
                <FormField
                  control={createConversationForm.control}
                  name='consultantId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chọn tư vấn viên</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Chọn tư vấn viên' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent
                          position="popper"
                          side="bottom"
                          align="start"
                          sideOffset={4}
                          avoidCollisions={true}
                          collisionPadding={16}
                          style={{ zIndex: 999999 }}
                          className="bg-white border shadow-xl max-h-48"
                          onCloseAutoFocus={(e) => e.preventDefault()}
                        >
                          {consultantsSelectionData?.map((item) => (
                            <SelectItem key={item.value} value={String(item.value)}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className='flex items-center justify-center'>
                <Button
                  disabled={createConversationMutation.isPending}
                  type='submit'
                  className='w-full'
                >
                  {createConversationMutation.isPending ? 'Đang tạo...' : 'Tạo'}
                </Button>
              </div>
            </form>
          </Form>
        )}
        {role === ROLE.consultant && (
          <Form {...createGroupConversationForm}>
            <form onSubmit={onConsultantSubmit}>
              <div className='mb-4'>
                <FormField
                  control={createGroupConversationForm.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên nhóm</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder='Nhập tên nhóm' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className='flex items-center justify-center'>
                <Button
                  disabled={createGroupConversationMutation.isPending}
                  type='submit'
                  className='w-full'
                >
                  {createGroupConversationMutation.isPending ? 'Đang tạo...' : 'Tạo'}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}

// Message Item Component with Facebook Messenger style
function MessageItem({ conversation, conversationIdActive }: {
  readonly conversationIdActive?: string
  readonly conversation: Conversation
}) {
  const queryClient = useQueryClient()
  const { user } = useContext(AppContext)
  const conversationQueryParams = useConversationQueryConfig()
  
  const chatHistoryQueryConfig: ChatHistoryConfig = {
    conversationId: conversation?.id as string,
    page: 0,
    size: 1000,
    sortBy: '',
    sortDir: 'asc'
  }

  const receiver = React.useMemo(() => {
    const currentUser = user || getUserFromLocalStorate()
    
    if (!conversation?.members || conversation.members.length === 0) {
      return null
    }
    
    // Map dữ liệu từ API backend sang format frontend
    const mappedMembers = conversation.members.map((member: any) => ({
      id: member.user?.id || member.id,
      name: member.user?.fullName || 'Người dùng',
      avatarUrl: member.user?.avatarUrl,
      sender: member.user?.id === currentUser?.id
    }))
    
    // Tìm người nhận (không phải người gửi hiện tại)
    const foundReceiver = mappedMembers.find((member) => member.id !== currentUser?.id)
    
    return foundReceiver
  }, [conversation, user])

  const navigate = useNavigate()

  const conversationId = conversation?.id
  const { data: chatHistory } = useQuery({
    queryKey: ['chat-history', chatHistoryQueryConfig],
    queryFn: () => getChatHistory(chatHistoryQueryConfig),
    enabled: !!conversationId
  })
  const chats = chatHistory?.data.data.content

  const lastChat = chats?.[chats?.length - 1]
  
  // Format last message preview
  const getLastMessagePreview = () => {
    if (!lastChat) return ''
    
    const isSender = lastChat.sender.id === user?.id
    const prefix = isSender ? 'Bạn: ' : ''
    
    // Nếu là file hoặc ảnh
    if (lastChat.fileUrl || lastChat.imageUrl) {
      const url = lastChat.fileUrl || lastChat.imageUrl || ''
      const isImage = url.match(/\.(jpg|jpeg|png|gif|webp)$/i)
      return prefix + (isImage ? '📷 Hình ảnh' : '📎 Tệp đính kèm')
    }
    
    // Nếu có message text
    if (lastChat.message) {
      return prefix + lastChat.message
    }
    
    return prefix + 'Tin nhắn'
  }
  
  const lastMessage = getLastMessagePreview()
  const isUnread = (conversation as any)?.unreadCount > 0

  const handleNavigateToOtherMessage = () => {
    if (conversationIdActive === conversation.id) return
    navigate({
      pathname: path.messages,
      search: createSearchParams({
        id: String(conversation.id)
      }).toString()
    })
  }

  const deleteConversationMutation = useMutation({
    mutationFn: (id: string) => deleteConversation(id)
  })

  const handleDeleteConversation = () => {
    deleteConversationMutation.mutate(conversation.id, {
      onSuccess: (res) => {
        toast.success(res.data.message)
        queryClient.invalidateQueries({
          queryKey: ['conversations', conversationQueryParams]
        })
      }
    })
  }

  const [elapsedTime, setElapsedTime] = useState<string>('')
  const calculateTimeDifference = () => {
    if (lastChat?.date) {
      const now = new Date().getTime()
      const sentTime = new Date(lastChat.date).getTime()
      const diffInMinutes = Math.floor((now - sentTime) / (1000 * 60))

      if (diffInMinutes < 1) {
        setElapsedTime('Vừa gửi')
      } else if (diffInMinutes < 60) {
        setElapsedTime(`${diffInMinutes} phút trước`)
      } else {
        const diffInHours = Math.floor(diffInMinutes / 60)
        setElapsedTime(`${diffInHours} giờ trước`)
      }
    }
  }

  React.useEffect(() => {
    calculateTimeDifference()
    const intervalId = setInterval(() => {
      calculateTimeDifference()
    }, 60000)

    return () => {
      clearInterval(intervalId)
    }
  }, [lastChat])

  return (
    <div
      aria-hidden='true'
      className={`flex items-center w-full px-4 py-3 transition-all cursor-pointer group relative ${
        conversation.id === conversationIdActive
          ? 'bg-blue-50 dark:bg-blue-950/20 border-r-2 border-blue-500'
          : isUnread 
            ? 'bg-blue-50/50 dark:bg-blue-950/10 hover:bg-blue-100 dark:hover:bg-blue-950/20 shadow-sm border-l-2 border-blue-400'
            : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
      }`}
      onClick={handleNavigateToOtherMessage}
    >
      <div className='relative mr-3'>
        <AvatarCustom 
          url={receiver?.avatarUrl || (conversation as any)?.consultant?.avatarUrl || (conversation as any)?.user?.avatarUrl} 
          fallback={conversation.isGroup ? 'GROUP' : 'USER'}
          className='size-12' 
          isOnline={!conversation.isGroup}
          showOnlineStatus={!conversation.isGroup}
        />
        {conversation.isGroup && (
          <div className='absolute -bottom-1 -right-1 size-4 bg-blue-500 rounded-full border-2 border-background flex items-center justify-center'>
            <span className='text-xs text-white font-bold'>{conversation.members?.length || 0}</span>
          </div>
        )}
      </div>
      
      <div className='flex-1 min-w-0'>
        <div className='flex items-center justify-between mb-1'>
          <p className={`text-sm truncate ${
            isUnread 
              ? 'font-bold text-blue-600 dark:text-blue-400' 
              : 'font-semibold text-gray-900 dark:text-gray-100'
          }`}>
            {conversation.isGroup 
              ? (conversation.name || 'Nhóm chat') 
              : (receiver?.name || (conversation as any)?.consultant?.fullName || (conversation as any)?.user?.fullName || 'Người dùng')
            }
          </p>
          <div className='flex items-center space-x-1'>
            {elapsedTime && (
              <span className={`text-xs ${isUnread ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>{elapsedTime}</span>
            )}
            {isUnread && (
              <Badge className='bg-blue-500 text-white text-xs px-1.5 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center animate-pulse'>
                {(conversation as any)?.unreadCount}
              </Badge>
            )}
          </div>
        </div>
        
        {lastMessage && (
          <div className='flex items-center justify-between'>
            <p className={`text-sm truncate ${
              isUnread 
                ? 'text-gray-900 dark:text-gray-100 font-medium' 
                : 'text-gray-600 dark:text-gray-400'
            }`}>
              {lastChat?.recalledForEveryone ? 'Đã thu hồi một tin nhắn' : lastMessage}
            </p>
            {lastChat?.sender.id === user?.id && (
              <div className='ml-2 flex items-center'>
                {(lastChat as any)?.isRead ? (
                  <CheckCheck className='size-4 text-blue-500' />
                ) : (
                  <Check className='size-4 text-gray-400' />
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className='opacity-0 group-hover:opacity-100 transition-opacity ml-2'>
        <DropdownMenu>
          <DropdownMenuTrigger className='p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700'>
            <MoreVertical className='size-4 text-gray-500' />
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-48'>
            <DropdownMenuItem
              aria-hidden='true'
              className='text-sm text-red-600 dark:text-red-400 font-medium cursor-pointer flex items-center px-3 py-2 hover:bg-red-50 dark:hover:bg-red-950/20'
              onClick={(e) => {
                e.stopPropagation()
                handleDeleteConversation()
              }}
            >
              <Trash2 className='size-4 mr-2' />
              Xóa đoạn chat
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

// Chat Header Component with Facebook Messenger style
function ChatHeader({ conversation, sender, receivers }: {
  readonly conversation: Conversation | undefined
  readonly sender: any
  readonly receivers: any[]
}) {
  // Calculate display information based on conversation type
  const displayInfo = React.useMemo(() => {
    if (!conversation) {
      return {
        name: 'Cuộc trò chuyện',
        avatarUrl: undefined,
        isGroup: false,
        memberCount: 0,
        isOnline: false
      }
    }

    if (conversation.isGroup) {
      return {
        name: conversation.name || 'Nhóm chat',
        avatarUrl: sender?.avatarUrl,
        isGroup: true,
        memberCount: conversation.members?.length || 0,
        isOnline: false
      }
    } else {
      // For direct conversation, get the other participant
      const otherParticipant = receivers?.[0] || 
        (conversation as any)?.consultant || 
        (conversation as any)?.user
      
      return {
        name: otherParticipant?.fullName || otherParticipant?.name || 'Người dùng',
        avatarUrl: otherParticipant?.avatarUrl,
        isGroup: false,
        memberCount: 1,
        isOnline: true // Assume online for demo
      }
    }
  }, [conversation?.id, conversation?.isGroup, conversation?.name, conversation?.members, receivers, sender])

  // Debug log for ChatHeader updates
  React.useEffect(() => {
  }, [conversation?.id, displayInfo.name, displayInfo.isGroup, receivers?.length])
  
  return (
    <div className='sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm'>
      <div className='flex items-center justify-between px-4 py-3'>
        <div className='flex items-center space-x-3'>
          <div className='relative'>
            <AvatarCustom
              url={displayInfo.avatarUrl}
              fallback={displayInfo.isGroup ? 'GROUP' : 'USER'}
              className='size-10'
              isOnline={displayInfo.isOnline}
              showOnlineStatus={!displayInfo.isGroup}
            />
            {displayInfo.isGroup && (
              <div className='absolute -bottom-1 -right-1 size-4 bg-blue-500 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center'>
                <span className='text-xs text-white font-bold'>{displayInfo.memberCount}</span>
              </div>
            )}
          </div>
          <div className='flex-1'>
            <p className='font-semibold text-gray-900 dark:text-gray-100 text-base'>
              {displayInfo.name}
            </p>
            {displayInfo.isGroup ? (
              <p className='text-sm text-gray-500 dark:text-gray-400'>{displayInfo.memberCount} thành viên</p>
            ) : (
              <div className='flex items-center space-x-1'>
                <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                <p className='text-sm text-gray-500 dark:text-gray-400'>Đang hoạt động</p>
              </div>
            )}
          </div>
        </div>
        
        <div className='flex items-center space-x-2'>
          <Button variant="ghost" size="icon" className='h-9 w-9 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800'>
            <Phone className='size-5 text-gray-600 dark:text-gray-400' />
          </Button>
          <Button variant="ghost" size="icon" className='h-9 w-9 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800'>
            <Video className='size-5 text-gray-600 dark:text-gray-400' />
          </Button>
          <Button variant="ghost" size="icon" className='h-9 w-9 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800'>
            <Info className='size-5 text-gray-600 dark:text-gray-400' />
          </Button>
        </div>
      </div>
    </div>
  )
}

// Chat Message Component with Facebook Messenger style
function ChatMessage({ isSender, chat, avatarCanShow, handleChooseMessageEdit }: {
  readonly isSender: boolean
  readonly chat: ChatType
  readonly avatarCanShow?: boolean
  readonly handleChooseMessageEdit?: (messageId: number, content: string) => void
}) {
  const chooseMessageEdit = () => {
    handleChooseMessageEdit?.(chat.id, chat.message)
  }

  const isHidden = chat.recalledBySender && !chat.recalledForEveryone && isSender
  const isShowRecalled = chat.recalledForEveryone

  if (isHidden) return null

  return (
    <div className={`flex items-end gap-2 py-1 group ${isSender ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar - Always show but with proper spacing */}
      <div className='flex-shrink-0'>
        {avatarCanShow ? (
          <AvatarCustom
            url={chat.sender.avatarUrl}
            className='size-8'
            showOnlineStatus={false}
          />
        ) : (
          <div className='size-8' /> // Invisible placeholder to maintain alignment
        )}
      </div>
      
      {/* Message bubble */}
      <div className={`flex flex-col max-w-[70%] ${isSender ? 'items-end' : 'items-start'}`}>
        {/* Sender name and time for group chats */}
        {avatarCanShow && (
          <div className={`flex items-center gap-2 mb-1 ${isSender ? 'flex-row-reverse' : 'flex-row'}`}>
            <span className='text-xs font-medium text-gray-600 dark:text-gray-400'>
              {chat.sender.name} {isSender && '(Bạn)'}
            </span>
            <span className='text-xs text-gray-500 dark:text-gray-500'>
              {formatDate(chat.date, true)}
            </span>
          </div>
        )}

        {/* Message content */}
        <div className={`flex items-end gap-2 ${isSender ? 'flex-row-reverse' : 'flex-row'}`}>
          {/* Message actions dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className='opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800'>
              <MoreHorizontal className='size-4 text-gray-500' />
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isSender ? 'end' : 'start'} className='w-40'>
              {isSender && !chat.imageUrl && (
                <DropdownMenuItem onClick={chooseMessageEdit} className='gap-2 text-sm'>
                  <span>Chỉnh sửa</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className='gap-2 text-sm text-red-600 dark:text-red-400'>
                <Trash2 className='size-4' />
                <span>Xóa</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Message bubble */}
          <div>
            {/* Display image or file */}
            {(chat.imageUrl || chat.fileUrl) && !isShowRecalled && (
              <div className='mb-2'>
                {(() => {
                  const url = chat.fileUrl || chat.imageUrl
                  const isImage = url.match(/\.(jpg|jpeg|png|gif|webp)$/i)
                  
                  return isImage ? (
                    <img
                      src={url}
                      alt='Message attachment'
                      className='max-w-xs rounded-lg object-cover cursor-pointer'
                      onClick={(e) => {
                        e.stopPropagation()
                        const link = document.createElement('a')
                        link.href = url
                        link.target = '_blank'
                        link.rel = 'noopener noreferrer'
                        link.click()
                      }}
                    />
                  ) : (
                    <div 
                      className='flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
                      onClick={(e) => {
                        e.stopPropagation()
                        const link = document.createElement('a')
                        link.href = url
                        link.target = '_blank'
                        link.rel = 'noopener noreferrer'
                        link.click()
                      }}
                    >
                      <Paperclip className='size-5 text-gray-600 dark:text-gray-400' />
                      <div className='flex-1 min-w-0'>
                        <p className='text-sm font-medium text-gray-900 dark:text-gray-100 truncate'>
                          {url.split('/').pop() || 'File đính kèm'}
                        </p>
                        <p className='text-xs text-gray-500 dark:text-gray-400'>Click để mở</p>
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}
            
            {chat.message && (
              <div className={`relative px-4 py-2 rounded-2xl text-sm break-words leading-relaxed ${
                isSender 
                  ? 'bg-blue-500 text-white rounded-br-md' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-md'
              } ${isShowRecalled ? 'italic opacity-60' : ''}`}>
                <div className='whitespace-pre-wrap'>
                  {chat.message}
                </div>
                
                {/* Message status indicators */}
                {isSender && (
                  <div className='flex items-center justify-end mt-1 space-x-1'>
                    {(chat as any).isRead ? (
                      <CheckCheck className='size-3 text-blue-200' />
                    ) : (
                      <Check className='size-3 text-blue-200' />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Typing Indicator Component
function TypingIndicator({ isTyping }: { readonly isTyping: boolean }) {
  if (!isTyping) return null

  return (
    <div className='flex items-center space-x-2 py-2 px-4'>
      <div className='flex space-x-1'>
        <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce' style={{ animationDelay: '0ms' }}></div>
        <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce' style={{ animationDelay: '150ms' }}></div>
        <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce' style={{ animationDelay: '300ms' }}></div>
      </div>
      <span className='text-sm text-gray-500 dark:text-gray-400'>Đang gõ...</span>
    </div>
  )
}

// Chat History Component
function ChatHistory({ conversation, chatData, sender, setMessageEdit }: {
  readonly conversation?: Conversation
  readonly chatData?: ChatType[]
  readonly sender?: any
  readonly setMessageEdit?: React.Dispatch<React.SetStateAction<{ messageId: number; content: string } | undefined>>
}) {
  const groupedMessages = React.useMemo(() => {
    if (!chatData || chatData.length === 0) return []

    const grouped: ChatType[][] = []
    let currentGroup: ChatType[] = []

    for (const element of chatData) {
      const chat = element
      if (currentGroup.length === 0) {
        currentGroup.push(chat)
      } else {
        const lastChatInGroup = currentGroup[currentGroup.length - 1]
        if (chat.sender.id === lastChatInGroup.sender.id) {
          currentGroup.push(chat)
        } else {
          grouped.push([...currentGroup])
          currentGroup = [chat]
        }
      }
    }

    if (currentGroup.length > 0) {
      grouped.push([...currentGroup])
    }

    return grouped
  }, [chatData, sender])

  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  
  const scrollToBottom = () => {
    // Use double requestAnimationFrame to ensure DOM is fully rendered
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'instant', block: 'end', inline: 'nearest' })
        }
      })
    })
  }
  
  React.useEffect(() => {
    scrollToBottom()
  }, [conversation?.id, chatData])

  const handleChooseMessageEdit = (messageId: number, content: string) => {
    setMessageEdit && setMessageEdit({ messageId, content })
  }

  return (
    <>
      {groupedMessages.map((group) => {
        const isSender = group[0].sender.id === sender?.id
        const avatarCanShow = true

        return (
          <div key={group[0].id} className='my-3'>
            {group.map((chat, chatIndex) => (
              <ChatMessage
                key={chat.id}
                isSender={isSender}
                avatarCanShow={chatIndex === 0 && avatarCanShow}
                chat={chat}
                handleChooseMessageEdit={handleChooseMessageEdit}
              />
            ))}
          </div>
        )
      })}
      <div ref={messagesEndRef} />
    </>
  )
}

// Chat Input Component with Facebook Messenger style
function ChatInput({ sendMessage, messageEdit, handleCloseUpdateMessage, handleUpdateMessage }: {
  readonly sendMessage: (message?: string, imageUrl?: string) => void
  readonly messageEdit?: { messageId: number; content: string }
  readonly handleCloseUpdateMessage?: () => void
  readonly handleUpdateMessage: (messageId: number, newContent: string) => void
}) {
  const form = useForm({
    defaultValues: {
      message: messageEdit?.content ? messageEdit?.content : ''
    }
  })

  const inputFileRef = React.useRef<HTMLInputElement>(null)

  const fileUploadMutation = useMutation({
    mutationFn: (body: FormData) => uploadFile(body)
  })

  const handleUploadFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Reset input để có thể chọn lại file giống nhau
      event.target.value = ''
      
      const formData = new FormData()
      formData.append('file', file)
      fileUploadMutation.mutate(formData, {
        onSuccess: (res) => {
          console.log('Upload success:', res.data.data.fileUrl)
          if (res.data.data.fileUrl) {
          sendMessage('', res.data.data.fileUrl)
          } else {
            toast.error('Không có URL file')
          }
        },
        onError: (error) => {
          console.error('Upload error:', error)
          toast.error('Lỗi khi upload file')
        }
      })
    }
  }

  const onSubmit = form.handleSubmit((values) => {
    const message = values.message
    if (!message.trim()) return
    if (!messageEdit) {
      sendMessage(message)
      form.setValue('message', '')
      return
    }
    if (message === messageEdit.content) return
    handleUpdateMessage && handleUpdateMessage(messageEdit.messageId, message)
  })

  React.useEffect(() => {
    if (!messageEdit) {
      form.reset({ message: '' })
      return
    }
    form.reset({ message: messageEdit.content })
  }, [messageEdit])

  return (
    <Form {...form}>
      <form onSubmit={onSubmit}>
        {!messageEdit && (
          <div className='bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-4 py-3'>
            <div className='flex items-center space-x-2'>
              {/* File upload button */}
              <Button
                type='button'
                variant="ghost"
                size="icon"
                className='h-9 w-9 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800'
                onClick={() => inputFileRef.current?.click()}
              >
                <Paperclip className='size-5 text-gray-600 dark:text-gray-400' />
              </Button>
              
              <Input
                ref={inputFileRef}
                type='file'
                className='hidden'
                onChange={handleUploadFile}
                accept='.jpg,.jpeg,.png,.gif'
              />
              
              {/* Message input */}
              <div className='flex-1 relative'>
                <FormField
                  control={form.control}
                  name='message'
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          className='rounded-full bg-gray-100 dark:bg-gray-800 border-0 px-4 py-2 pr-12 text-sm placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-700'
                          autoComplete='off'
                          placeholder='Nhập tin nhắn...'
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                {/* Emoji button */}
                <Button
                  type='button'
                  variant="ghost"
                  size="icon"
                  className='absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700'
                >
                  <Smile className='size-4 text-gray-600 dark:text-gray-400' />
                </Button>
              </div>
              
              {/* Send button */}
              <Button
                type='submit'
                size="icon"
                className='h-9 w-9 rounded-full bg-blue-500 hover:bg-blue-600 text-white'
                disabled={!form.watch('message')?.trim()}
              >
                <Send className='size-4' />
              </Button>
            </div>
          </div>
        )}
        
        {messageEdit && (
          <div className='bg-yellow-50 dark:bg-yellow-950/20 border-t border-yellow-200 dark:border-yellow-800 px-4 py-3'>
            <div className='flex items-center justify-between mb-2'>
              <p className='text-sm font-medium text-yellow-800 dark:text-yellow-200'>Chỉnh sửa tin nhắn</p>
              <Button
                type='button'
                variant="ghost"
                size="icon"
                className='h-6 w-6 rounded-full hover:bg-yellow-200 dark:hover:bg-yellow-800'
                onClick={handleCloseUpdateMessage}
              >
                <X className='size-4' />
              </Button>
            </div>
            <div className='flex items-center space-x-2'>
              <div className='flex-1'>
                <FormField
                  control={form.control}
                  name='message'
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          className='rounded-lg bg-white dark:bg-gray-800 border-yellow-300 dark:border-yellow-700 text-sm'
                          autoComplete='off'
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <Button
                type='submit'
                size="icon"
                className='h-8 w-8 rounded-full bg-green-500 hover:bg-green-600 text-white'
              >
                <CheckCircle2Icon className='size-4' />
              </Button>
            </div>
          </div>
        )}
      </form>
    </Form>
  )
}

// Chat Component
function Chat({ conversation }: { readonly conversation: Conversation | undefined }) {

  const chatHistoryQueryConfig: ChatHistoryConfig = {
    conversationId: conversation?.id as string,
    page: 0,
    size: 1000,
    sortBy: '',
    sortDir: 'asc'
  }
  // Socket connection state

  // Get current user from AppContext instead of finding sender in conversation members
  const { user: currentUser } = useContext(AppContext)
  const { refetch: refetchUnread } = useUnreadConversationCount()
  
  const sender = React.useMemo(() => {
    // Use current authenticated user as sender
    // Fallback to localStorage if context doesn't have user
    const user = currentUser || getUserFromLocalStorate()
    return user
  }, [currentUser])

  const receivers = React.useMemo(() => {
    // Get all members except the current user
    const user = currentUser || getUserFromLocalStorate()
    
    if (!conversation?.members || conversation.members.length === 0) {
      return []
    }
    
    // Map members to include proper user information
    const mappedMembers = conversation.members
      .filter((member) => {
        const memberId = member.user?.id || member.id
        return memberId !== user?.id
      })
      .map((member: any) => ({
        id: member.user?.id || member.id,
        name: member.user?.fullName || member.fullName || 'Người dùng',
        avatarUrl: member.user?.avatarUrl || member.avatarUrl,
      }))
    
    return mappedMembers
  }, [conversation?.id, conversation?.members, currentUser?.id])

  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [isTyping, setIsTyping] = useState<boolean>(false)
  const [messageEdit, setMessageEdit] = useState<{
    messageId: number
    content: string
  }>()

  const conversationId = conversation?.id
  const { data: chatHistory, refetch } = useQuery({
    queryKey: ['chat-history', chatHistoryQueryConfig],
    queryFn: () => getChatHistory(chatHistoryQueryConfig),
    enabled: !!conversationId
  })

  const updateMessageMutation = useMutation({
    mutationFn: ({ messageId, newContent }: { messageId: number; newContent: string }) =>
      updateMessage(messageId, newContent)
  })

  // Kết nối socket
  const connectSocket = () => {
    const accessToken = socketService.getStoredToken()
    
    if (!accessToken) {
      toast.error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.')
      return
    }
    
    // Kiểm tra token có hợp lệ không
    if (!socketService.checkTokenValidity(accessToken)) {
      toast.error('Token đã hết hạn. Vui lòng đăng nhập lại.')
      return
    }
    
    if (!sender?.id) {
      toast.error('Không xác định được người dùng')
      return
    }

    try {
      // Kết nối socket
      socketService.connect(sender.id.toString(), accessToken)
      
      // Lắng nghe sự kiện kết nối
      socketService.on('connect', () => {
        setIsConnected(true)
        toast.success('Đã kết nối thành công!')
        
        // Join conversation after successful connection
        if (conversationId) {
          socketService.joinConversation(conversationId.toString())
        }
      })

      // Lắng nghe lỗi kết nối
      socketService.on('connect_error', (error) => {
        setIsConnected(false)
        toast.error(`Lỗi kết nối: ${error.message}`)
      })

      // Lắng nghe ngắt kết nối
      socketService.on('disconnect', (reason) => {
        setIsConnected(false)
        if (reason === 'io server disconnect') {
          toast.error('Server đã ngắt kết nối')
        } else {
          toast.warning('Mất kết nối với server')
        }
      })

      // Lắng nghe tin nhắn mới
      socketService.on('newMessage', () => {
        refetch()
      })

      // Lắng nghe tin nhắn được cập nhật
      socketService.on('messageUpdated', () => {
        refetch()
      })

      // Lắng nghe tin nhắn bị xóa
      socketService.on('messageDeleted', () => {
        refetch()
      })

      // Lắng nghe typing indicator
      socketService.on('typing', () => {
        setIsTyping(true)
        setTimeout(() => setIsTyping(false), 3000)
      })

      socketService.on('stopTyping', () => {
        setIsTyping(false)
      })

    } catch {
      setIsConnected(false)
      toast.error('Lỗi khi kết nối socket')
    }
  }

  // Ngắt kết nối socket
  const disconnectSocket = () => {
    socketService.disconnect()
    setIsConnected(false)
  }

  // Gửi tin nhắn
  const sendPrivateValue = (message?: string, imageUrl?: string) => {
    if (!conversation) {
      toast.error('Không có cuộc trò chuyện nào được chọn')
      return
    }

    if (!sender?.id) {
      toast.error('Không xác định được người gửi')
      return
    }

    if (socketService.isConnected) {
      try {
        socketService.sendMessage({
          conversationId: conversation.id.toString(),
          message: message || '',
          imageUrl: imageUrl || ''
        })
        
        // Optimistically refetch to show the message immediately
        setTimeout(() => {
          refetch()
        }, 100)
      } catch (error) {
        toast.error('Lỗi khi gửi tin nhắn')
      }
    } else {
      toast.error('Kết nối bị mất. Vui lòng thử lại.')
      
      // Try to reconnect
      connectSocket()
    }
  }

  const handleUpdateMessage = (messageId: number, newContent: string) => {
    if (socketService.isConnected) {
      socketService.updateMessage(messageId, newContent)
      setMessageEdit(undefined)
    } else {
      // Fallback to API call if socket not connected
      updateMessageMutation.mutate(
        { messageId, newContent },
        {
          onSuccess: () => {
            refetch()
            setMessageEdit(undefined)
          }
        }
      )
    }
  }

  const handleCloseUpdateMessage = () => {
    setMessageEdit(undefined)
  }

  React.useEffect(() => {
    if (sender?.id && !isConnected) {
      connectSocket()
    }
  }, [sender?.id])

  React.useEffect(() => {
    if (conversation && sender?.id) {
      // Đánh dấu cuộc hội thoại đã đọc khi user vào
      markConversationAsRead(conversation.id.toString()).then(() => {
        // Refetch để cập nhật unread count từ server
        refetchUnread()
      }).catch(() => {
        // Silent error handling
      })

      disconnectSocket()
      
      // Small delay to ensure clean disconnection
      setTimeout(() => {
        connectSocket()
      }, 100)
    }

    return () => {
      disconnectSocket()
    }
  }, [conversation?.id])

  return (
    <div className='h-full flex flex-col bg-white dark:bg-gray-900'>
      <ChatHeader conversation={conversation} sender={sender} receivers={receivers || []} />
      
      {/* Connection Status Indicator */}
      {!isConnected && (
        <div className='px-4 py-2 text-xs text-center bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-b border-red-200 dark:border-red-800'>
          <div className='flex items-center justify-center space-x-2'>
            <div className='w-2 h-2 bg-red-500 rounded-full animate-pulse'></div>
            <span>Mất kết nối</span>
            <button 
              onClick={connectSocket}
              className="ml-2 px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
            >
              Thử kết nối lại
            </button>
          </div>
        </div>
      )}
      
      {/* Messages Area */}
      <div className='flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900'>
        <div className='px-4 py-4'>
          <ChatHistory
            conversation={conversation}
            sender={sender}
            chatData={chatHistory?.data.data.content}
            setMessageEdit={setMessageEdit}
          />
          <TypingIndicator isTyping={isTyping} />
        </div>
      </div>
      
      {/* Input Area */}
      <ChatInput
        messageEdit={messageEdit}
        sendMessage={sendPrivateValue}
        handleCloseUpdateMessage={handleCloseUpdateMessage}
        handleUpdateMessage={handleUpdateMessage}
      />
    </div>
  )
}

export default function Message() {
  const { id } = useQueryParams()
  const navigate = useNavigate()
  const conversationQueryParams = useConversationQueryConfig()
  const [conversationActive, setConversationActive] = useState<Conversation>()
  const [searchText, setSearchText] = useState<string>('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const { data: conversations, error: conversationsError, isLoading: conversationsLoading } = useQuery({
    queryKey: ['conversations', conversationQueryParams],
    queryFn: () => getConversations(conversationQueryParams)
  })

  // when access to component, choose the first conversation and show it
  useEffect(() => {
    if (!conversations?.data?.data?.content || id) {
      setConversationActive(undefined)
      return
    }
    const data = conversations.data.data.content
    if (data?.length !== 0) {
      navigate({
        pathname: path.messages,
        search: createSearchParams({
          ...conversationQueryParams,
          id: String(data[0].id)
        }).toString()
      })
    }
  }, [conversations, id, navigate])

  // handle when user choose other conversation
  useEffect(() => {
    if (!conversations?.data?.data?.content) return
    const data = conversations.data.data.content
    const conversationActive = data.find((obj) => obj.id === id)
    setConversationActive(conversationActive as Conversation)
  }, [conversations, id])

  // Auto search với debounce
  useEffect(() => {
    if (searchText === undefined) return
    
    const timer = setTimeout(() => {
      const params: any = { 
        page: conversationQueryParams.page,
        size: conversationQueryParams.size,
        sortBy: conversationQueryParams.sortBy,
        sortDir: conversationQueryParams.sortDir
      }
      if (searchText.trim()) {
        params.name = searchText.trim()
      }
    navigate({
      pathname: path.messages,
        search: createSearchParams(params).toString()
      })
    }, 500)
    
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText])

  return (
    <div className='bg-gray-50 dark:bg-gray-900 h-[calc(100vh-var(--header-height))] flex'>
      {/* Sidebar - Conversation List */}
      <div className={`${isMobileMenuOpen ? 'flex' : 'hidden'} lg:flex w-full lg:w-80 xl:w-96 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-col`}>
        {/* Header */}
        <div className='p-4 border-b border-gray-200 dark:border-gray-700'>
          <div className='flex items-center justify-between mb-4'>
            <h1 className='text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center'>
              <MessageCircleIcon className='size-6 text-blue-500 mr-2' />
              Nhắn tin
            </h1>
            <Button
              variant="ghost"
              size="icon"
              className='lg:hidden'
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className='size-5' />
            </Button>
          </div>
          
          {/* Search */}
          <div className='flex items-center space-x-2'>
            <div className='flex-1 relative'>
              <MagnifyingGlassIcon className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400' />
              <Input
                value={searchText}
                placeholder='Tìm kiếm cuộc trò chuyện...'
                className='pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-full text-sm placeholder:text-gray-500 dark:placeholder:text-gray-400'
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
            <CreateNewConversation conversationQueryParams={conversationQueryParams} />
          </div>
        </div>

        {/* Conversation List */}
        <ScrollArea className='flex-1'>
          {conversationsLoading ? (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <div className='flex flex-col items-center space-y-2'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
                <p>Đang tải...</p>
              </div>
            </div>
          ) : conversationsError ? (
            <div className="flex items-center justify-center h-full text-red-500">
              <div className='text-center'>
                <p className='font-medium'>Lỗi khi tải danh sách</p>
                <p className='text-sm'>Vui lòng thử lại sau</p>
              </div>
            </div>
          ) : conversations?.data?.data?.content?.length ? (
            <div className='p-2'>
              {/* Sort conversations: unread first, then read */}
              {conversations.data.data.content
                .sort((a: Conversation, b: Conversation) => {
                  const aUnread = (a as any)?.unreadCount || 0
                  const bUnread = (b as any)?.unreadCount || 0
                  return bUnread - aUnread // Unread messages come first
                })
                .map((conversation: Conversation) => (
                  <MessageItem
                    key={conversation.id}
                    conversation={conversation}
                    conversationIdActive={conversationActive?.id}
                  />
                ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <div className='text-center'>
                <MessageCircleIcon className='size-12 mx-auto mb-3 text-gray-300 dark:text-gray-600' />
                <p className='font-medium'>Chưa có cuộc trò chuyện nào</p>
                <p className='text-sm'>Bắt đầu cuộc trò chuyện mới</p>
              </div>
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className='flex-1 flex flex-col'>
        {conversationActive ? (
          <Chat conversation={conversationActive} />
        ) : (
          <div className='flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900'>
            <div className='text-center'>
              <MessageCircleIcon className='size-16 mx-auto mb-4 text-gray-300 dark:text-gray-600' />
              <h2 className='text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2'>
                Chọn một cuộc trò chuyện
              </h2>
              <p className='text-gray-500 dark:text-gray-500'>
                Bắt đầu trò chuyện với bạn bè hoặc tạo nhóm mới
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Mobile menu button */}
      {!isMobileMenuOpen && (
        <Button
          variant="ghost"
          size="icon"
          className='lg:hidden fixed top-24 left-4 z-50 bg-white dark:bg-gray-800 shadow-lg'
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <MessageCircleIcon className='size-5' />
        </Button>
      )}
    </div>
  )
}
