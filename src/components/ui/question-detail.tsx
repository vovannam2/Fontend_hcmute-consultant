import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { User, ThumbsUp, UsersIcon } from 'lucide-react'
import { Question as QuestionType } from '@/types/question.type'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useState, useMemo, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  countLikeOfQuestion,
  getLikeUsersOfQuestion,
  likeQuestion,
  unLikeQuestion,
  getQuestionRecord
} from '@/apis/like.api'
import { UserInfo } from '@/types/like.type'
import { AppContext } from '@/contexts/app.context'
import { useContext } from 'react'

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  readonly question: QuestionType
}

export default function QuestionDetail({ question, className }: Props) {
  const queryClient = useQueryClient()
  const { user } = useContext(AppContext)
  const [showLikeUsers, setShowLikeUsers] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Handle component mount/unmount
  useEffect(() => {
    setIsMounted(true)
    return () => {
      setIsMounted(false)
      setShowLikeUsers(false)
    }
  }, [])

  // Get like record to check if user has liked - only when component is mounted and user exists
  const { data: questionRecordRes } = useQuery({
    queryKey: ['question-record', question.id],
    queryFn: () => getQuestionRecord(question.id),
    enabled: isMounted && !!question.id && !!user?.id
  })

  const isLiked = useMemo(() => {
    const questionRecord = questionRecordRes?.data.data
    return questionRecord?.some((item) => item.likeKey.userId === user?.id) ?? false
  }, [questionRecordRes, user?.id])

  // Like/Unlike mutations
  const likeQuestionMutation = useMutation({
    mutationFn: (questionId: string) => likeQuestion(questionId)
  })

  const unLikeQuestionMutation = useMutation({
    mutationFn: (questionId: string) => unLikeQuestion(questionId)
  })

  const handleToggleLike = () => {
    if (!question.id) return
    
    if (!isLiked) {
      likeQuestionMutation.mutate(question.id, {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ['count-like-of-questions', question.id]
          })
          queryClient.invalidateQueries({
            queryKey: ['question-record', question.id]
          })
          queryClient.invalidateQueries({
            queryKey: ['like-users-question', question.id]
          })
        }
      })
      return
    }
    unLikeQuestionMutation.mutate(question.id, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['count-like-of-questions', question.id]
        })
        queryClient.invalidateQueries({
          queryKey: ['question-record', question.id]
        })
        queryClient.invalidateQueries({
          queryKey: ['like-users-question', question.id]
        })
      }
    })
  }

  const { data: countLikes } = useQuery({
    queryKey: ['count-like-of-questions', question.id],
    queryFn: () => countLikeOfQuestion(question.id),
    enabled: isMounted && !!question.id
  })

  const { data: likeUsersData, isLoading: isLoadingLikeUsers } = useQuery({
    queryKey: ['like-users-question', question.id],
    queryFn: () => getLikeUsersOfQuestion(question.id),
    enabled: isMounted && !!question.id && showLikeUsers
  })

  const Skeleton = ({ className }: { className?: string }) => (
    <div className={cn('animate-pulse bg-gray-200 rounded', className)} />
  )

  // Helpers: xác định file có phải ảnh và hàm tải về bằng blob
  const getExtension = (url?: string) => (url ? url.split('?')[0].split('#')[0].split('.').pop()?.toLowerCase() : '')
  const isImageUrl = (url?: string) => {
    const ext = getExtension(url)
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext || '')
  }

  const downloadFile = async (url: string, filename?: string) => {
    try {
      const res = await fetch(url, { credentials: 'omit', mode: 'cors' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const blob = await res.blob()
      const objectUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = objectUrl
      a.download = filename || (url.split('/').pop() || 'download')
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(objectUrl)
    } catch (err) {
      console.error('Download failed:', err)
      // Fallback: mở tab mới
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  // Early return if not mounted or no question
  if (!isMounted || !question) {
    return (
      <div className={cn('bg-background rounded-lg border border-gray-200 p-5', className)}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'bg-background rounded-lg border border-gray-200',
        'hover:border-blue-200 hover:shadow-sm',
        'transition-all duration-300',
        className
      )}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={question.askerAvatarUrl} />
              <AvatarFallback>
                <User className="h-5 w-5 text-gray-400" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-foreground">
                {question.askerFullName}
              </h3>
              <time className="text-sm text-secondary-foreground">
                {format(new Date(question.createdAt), 'dd MMM yyyy', { locale: vi })}
              </time>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-secondary-foreground">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className={cn('gap-1.5', isLiked ? 'text-primary' : 'text-secondary-foreground')}
                onClick={handleToggleLike}
              >
                <ThumbsUp className={cn('h-4 w-4', isLiked && 'fill-current')} strokeWidth={1.5} />
                <span>{countLikes?.data.data || 0}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-1.5 cursor-pointer hover:text-primary text-primary/90 border border-primary/20 px-2 py-1 rounded-md bg-primary/10"
                onClick={() => setShowLikeUsers(true)}
              >
                <UsersIcon className="size-4" />
                <span className="font-medium"></span>
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="bg-blue-50 text-blue-600">
              {question.department.name}
            </Badge>
            <Badge variant="secondary" className="bg-indigo-50 text-indigo-600">
              {question.field.name}
            </Badge>
          </div>
          <h2 className="text-lg font-semibold text-foreground">{question.title}</h2>
          <p className="mt-2 text-secondary-foreground" dangerouslySetInnerHTML={{ __html: question.content }}></p>
          
          {question?.fileUrl && question.fileUrl.trim() !== '' && (
            <div className="mt-3">
              <p className="text-sm text-muted-foreground mb-2">📎 Tệp đính kèm:</p>
              {isImageUrl(question.fileUrl) ? (
                <img
                  src={question.fileUrl}
                  alt="Question attachment"
                  className="max-w-full h-auto rounded-lg border"
                  onError={(e) => {
                    console.error('❌ Error loading image:', question.fileUrl)
                    e.currentTarget.style.display = 'none'
                  }}
                  onLoad={() => {}}
                />
              ) : (
                <Button
                  variant="secondary"
                  className="border border-primary/30"
                  onClick={() => downloadFile(question.fileUrl)}
                >
                  Tải tệp
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Answer Preview */}
        {question.answerContent && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={question.answerAvatarUrl} />
                <AvatarFallback>
                  <User className="h-4 w-4 text-gray-400" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">
                    {question.answerUserFullName}
                  </span>
                  <time className="text-sm text-secondary-foreground">
                    {format(new Date(question.answerCreatedAt), 'dd MMM yyyy', { locale: vi })}
                  </time>
                </div>
                <p
                  className="mt-1 text-secondary-foreground text-sm"
                  dangerouslySetInnerHTML={{ __html: question.answerContent }}
                ></p>
                {question?.answerFileUrl && question.answerFileUrl.trim() !== '' && (
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground mb-2">📎 Tệp đính kèm trả lời:</p>
                    {isImageUrl(question.answerFileUrl) ? (
                      <img
                        src={question.answerFileUrl}
                        alt="Answer attachment"
                        className="max-w-full h-auto rounded-lg border"
                        onError={(e) => {
                          console.error('❌ Error loading answer image:', question.answerFileUrl)
                          e.currentTarget.style.display = 'none'
                        }}
                        onLoad={() => {}}
                      />
                    ) : (
                      <Button
                        variant="secondary"
                        className="border border-primary/30"
                        onClick={() => downloadFile(question.answerFileUrl)}
                      >
                        Tải tệp trả lời
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <Dialog 
        key={`like-users-dialog-${question.id}-${isMounted}`}
        open={showLikeUsers && isMounted} 
        onOpenChange={(open) => {
          if (!open) {
            setShowLikeUsers(false)
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Người đã thích câu hỏi</DialogTitle>
            <DialogDescription>
              Danh sách những người đã thích câu hỏi này
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[300px] overflow-y-auto">
            {isLoadingLikeUsers ? (
              <div className="space-y-3 p-2">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : likeUsersData?.data?.data && likeUsersData.data.data.length > 0 ? (
              <div className="space-y-3 p-2">
                {likeUsersData.data.data.map((user: UserInfo) => (
                  <div key={user.id} className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.avatarUrl} />
                      <AvatarFallback>{`${user.fullName?.charAt(0) || ''}`}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.fullName || ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">Không có thông tin người thích</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
