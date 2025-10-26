import { getAllQuestion } from '@/apis/question.api'
import useQuestionQueryConfig, { QuestionQueryConfig } from '@/hooks/useQuestionQueryConfig'
import { Spinner } from '@/icons'
import { Question as QuestionType } from '@/types/question.type'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState, useMemo } from 'react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { User, ThumbsUp, UsersIcon, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useMutation, useQueryClient } from '@tanstack/react-query'
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

// Simple FileShow component using only UI components
function FileShow({ url, className }: { url?: string; className?: string }) {
  const [fileType, setFileType] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  
  const checkFileType = async (fileUrl: string) => {
    try {
      setIsLoading(true)
      
      // Check file extension first (more reliable for PDFs)
      const extension = fileUrl.split('.').pop()?.toLowerCase()
      
      // If it's a PDF, treat as file immediately
      if (extension === 'pdf') {
        setFileType('file')
        setIsLoading(false)
        return
      }
      
      // For other files, try to fetch and check content type
      const response = await fetch(fileUrl)
      const contentType = response.headers.get('Content-Type')
      
      if (contentType) {
        if (contentType.includes('image')) {
          setFileType('image')
        } else {
          setFileType('file')
        }
      } else {
        // Fallback: check file extension if Content-Type is not available
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
          setFileType('image')
        } else {
          setFileType('file')
        }
      }
    } catch (error) {
      console.error('🔍 FileShow - Error fetching file:', error)
      // Fallback: check file extension if fetch fails
      const extension = fileUrl.split('.').pop()?.toLowerCase()
      if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
        setFileType('image')
      } else {
        setFileType('file')
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (url) {
      checkFileType(url)
    } else {
      setIsLoading(false)
    }
  }, [url])

  
  if (!url) {
    return null
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className={cn("mt-3", className)}>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          Đang tải file...
        </div>
      </div>
    )
  }

  if (fileType === 'image') {
    return (
      <div className={cn("mt-3", className)}>
        <img 
          src={url} 
          alt="Question image" 
          className="max-w-full h-auto rounded-lg border"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
      </div>
    )
  } else if (fileType === 'file') {
    return (
      <div className={cn("mt-3", className)}>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2"
          onClick={() => {
            // Tạo link download trực tiếp
            const link = document.createElement('a')
            link.href = url
            link.download = url.split('/').pop() || 'file-dinh-kem' // Lấy tên file từ URL
            link.target = '_blank'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
          }}
        >
          <FileText className="w-4 h-4" />
          Tải file đính kèm
        </Button>
      </div>
    )
  }

  // Fallback: show file button if type is unknown
  return (
    <div className={cn("mt-3", className)}>
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-2"
        onClick={() => {
          const link = document.createElement('a')
          link.href = url
          link.download = url.split('/').pop() || 'file-dinh-kem'
          link.target = '_blank'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }}
      >
        <FileText className="w-4 h-4" />
        Tải file đính kèm
      </Button>
    </div>
  )
}

// Simple Question component using only UI components
function Question({ question, className }: { question: QuestionType; className?: string }) {
  const queryClient = useQueryClient()
  const { user } = useContext(AppContext)
  const [showLikeUsers, setShowLikeUsers] = useState(false)

  // Get like record to check if user has liked
  const { data: questionRecordRes } = useQuery({
    queryKey: ['question-record', question.id],
    queryFn: () => getQuestionRecord(question.id),
    enabled: !!question.id && !!user?.id
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
    enabled: !!question.id
  })

  const { data: likeUsersData, isLoading: isLoadingLikeUsers } = useQuery({
    queryKey: ['like-users-question', question.id],
    queryFn: () => getLikeUsersOfQuestion(question.id),
    enabled: !!question.id && showLikeUsers
  })

  return (
    <Card className={cn("hover:shadow-md transition-all duration-300", className)}>
      <CardHeader className="pb-3">
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <Avatar className='h-10 w-10'>
              <AvatarImage src={question.askerAvatarUrl} />
              <AvatarFallback>
                <User className='h-5 w-5 text-gray-400' />
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className='font-medium text-foreground'>
                {question.askerFullName}
              </h3>
              <time className='text-sm text-secondary-foreground'>
                {format(new Date(question.createdAt), 'dd MMM yyyy', { locale: vi })}
              </time>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='ghost'
              size='sm'
              className={cn('gap-1.5', isLiked ? 'text-primary' : 'text-secondary-foreground')}
              onClick={handleToggleLike}
            >
              <ThumbsUp className={cn('h-4 w-4', isLiked && 'fill-current')} strokeWidth={1.5} />
              <span>{countLikes?.data.data || 0}</span>
            </Button>
            <Button
              variant='ghost'
              size='sm'
              className='flex items-center space-x-1.5 cursor-pointer hover:text-primary text-primary/90 border border-primary/20 px-2 py-1 rounded-md bg-primary/10'
              onClick={() => setShowLikeUsers(true)}
            >
              <UsersIcon className='size-4' />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className='flex items-center gap-2 mb-3'>
          <Badge variant='secondary' className='bg-blue-50 text-blue-600'>
            {question.department.name}
          </Badge>
          <Badge variant='secondary' className='bg-indigo-50 text-indigo-600'>
            {question.field.name}
          </Badge>
        </div>
        
        <h2 className='text-lg font-semibold text-foreground mb-2'>{question.title}</h2>
        <div className='text-secondary-foreground' dangerouslySetInnerHTML={{ __html: question.content }}></div>
        
        {question?.fileUrl && <FileShow url={question?.fileUrl} />}

        {/* Answer Preview */}
        {question.answerContent && (
          <div className='mt-4 pt-4 border-t border-gray-100'>
            <div className='flex items-start gap-3'>
              <Avatar className='h-8 w-8'>
                <AvatarImage src={question.answerAvatarUrl} />
                <AvatarFallback>
                  <User className='h-4 w-4 text-gray-400' />
                </AvatarFallback>
              </Avatar>
              <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-2'>
                  <span className='font-medium text-foreground'>
                    {question.answerUserFullName}
                  </span>
                  <time className='text-sm text-secondary-foreground'>
                    {format(new Date(question.answerCreatedAt), 'dd MMM yyyy', { locale: vi })}
                  </time>
                </div>
                <p
                  className='mt-1 text-secondary-foreground text-sm'
                  dangerouslySetInnerHTML={{ __html: question.answerContent }}
                ></p>
                
                {question?.answerFileUrl && <FileShow url={question?.answerFileUrl} />}
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <Dialog open={showLikeUsers} onOpenChange={(open) => !open && setShowLikeUsers(false)}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Người đã thích câu hỏi</DialogTitle>
          </DialogHeader>

          <div className='max-h-[300px] overflow-y-auto'>
            {isLoadingLikeUsers ? (
              <div className='space-y-3 p-2'>
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className='flex items-center gap-3'>
                    <div className='h-10 w-10 rounded-full bg-gray-200 animate-pulse' />
                    <div>
                      <div className='h-4 w-32 bg-gray-200 rounded animate-pulse mb-2' />
                      <div className='h-3 w-20 bg-gray-200 rounded animate-pulse' />
                    </div>
                  </div>
                ))}
              </div>
            ) : likeUsersData?.data?.data && likeUsersData.data.data.length > 0 ? (
              <div className='space-y-3 p-2'>
                {likeUsersData.data.data.map((user: UserInfo) => (
                  <div key={user.id} className='flex items-center gap-3'>
                    <Avatar>
                      <AvatarImage src={user.avatarUrl} />
                      <AvatarFallback>{`${user.fullName?.charAt(0) || ''}`}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className='font-medium'>{user.fullName || ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='py-8 text-center text-gray-500'>Không có thông tin người thích</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

export default function ListQuestion() {
  const initialQuestionQueryConfig: QuestionQueryConfig = useQuestionQueryConfig()
  const [listQuestion, setListQuestion] = useState<QuestionType[]>([])
  const [questionQueryConfig, setQuestionQueryConfig] = useState(initialQuestionQueryConfig)

  const {
    data: questions,
    isLoading,
    isFetching,
    isError
  } = useQuery({
    queryKey: ['questions', questionQueryConfig],
    queryFn: () => getAllQuestion(questionQueryConfig),
    refetchOnMount: true
  })

  // when user scroll to end page => fetch question with next page
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight

      if (scrollTop + windowHeight >= documentHeight) {
        setQuestionQueryConfig((prev) => ({
          ...prev,
          page: String(parseInt(prev.page) + 1)
        }))
      }
    }

    if (!isFetching && !isError) window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isFetching, isError])

  // if user choose one of departments => reset list question and set new question query config
  const json = JSON.stringify(initialQuestionQueryConfig)
  useEffect(() => {
    setListQuestion([])
    setQuestionQueryConfig(initialQuestionQueryConfig)
  }, [json])

  const questionJson = JSON.stringify(questions)

  // add new question fetched to state list question
  useEffect(() => {
    if (questions?.data.data.content) {
      setListQuestion((prev) => [...prev, ...questions.data.data.content])
    }
  }, [questionJson])

  return (
    <div>
      <div className='space-y-8'>
        {listQuestion.map((question) => (
          <Question key={question.id} question={question} />
        ))}
      </div>
      <div className='mt-4 flex items-center justify-center'>{isLoading && <Spinner />}</div>
    </div>
  )
}
