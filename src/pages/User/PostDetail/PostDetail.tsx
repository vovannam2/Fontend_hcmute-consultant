import { getPostDetail } from '@/apis/post.api'
import { getComments } from '@/apis/comment.api'
import { likePost, unlikePost, countLikeOfPost, getPostRecord } from '@/apis/like.api'
import { createComment } from '@/apis/comment.api'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FileIcon, MessageCircle, User, Calendar, Loader2, ThumbsUp, Send } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { format, formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { toast } from 'sonner'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export default function PostDetail() {
  const { id } = useParams()
  const postId = id as string
  const queryClient = useQueryClient()
  const [commentText, setCommentText] = useState('')

  const { data: postResponse, isLoading: isLoadingPost, isError: isErrorPost } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => getPostDetail(postId),
    enabled: !!postId
  })

  const { data: commentsResponse, isLoading: isLoadingComments } = useQuery({
    queryKey: ['comments', postId],
    queryFn: () => getComments(postId),
    enabled: !!postId
  })

  const { data: likeCount } = useQuery({
    queryKey: ['count-like-post', postId],
    queryFn: () => countLikeOfPost(postId),
    enabled: !!postId
  })

  const { data: likeRecord } = useQuery({
    queryKey: ['like-record-post', postId],
    queryFn: () => getPostRecord(postId),
    enabled: !!postId
  })

  const post = postResponse?.data.data
  const comments = commentsResponse?.data.data || []
  const likes = likeCount?.data.data || 0
  const isLiked = likeRecord?.data.data && likeRecord.data.data.length > 0

  const likePostMutation = useMutation({
    mutationFn: () => likePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['count-like-post', postId] })
      queryClient.invalidateQueries({ queryKey: ['like-record-post', postId] })
      toast.success('Đã thích bài viết')
    },
    onError: (error: any) => {
      console.error('Like error:', error)
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra')
    }
  })

  const unlikePostMutation = useMutation({
    mutationFn: () => unlikePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['count-like-post', postId] })
      queryClient.invalidateQueries({ queryKey: ['like-record-post', postId] })
      toast.success('Đã bỏ thích bài viết')
    },
    onError: (error: any) => {
      console.error('Unlike error:', error)
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra')
    }
  })

  const commentMutation = useMutation({
    mutationFn: (text: string) => createComment(postId, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] })
      setCommentText('')
      toast.success('Đã thêm bình luận')
    },
    onError: (error: any) => {
      console.error('Comment error:', error)
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra')
    }
  })

  const handleLike = () => {
    if (isLiked) {
      unlikePostMutation.mutate()
    } else {
      likePostMutation.mutate()
    }
  }

  const handleComment = () => {
    if (!commentText.trim()) {
      toast.error('Vui lòng nhập bình luận')
      return
    }
    commentMutation.mutate(commentText)
  }

  if (isLoadingPost) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    )
  }

  if (isErrorPost || !post) {
    return (
      <div className='p-6'>
        <Card>
          <CardContent className='pt-6'>
            <p className='text-center text-muted-foreground'>Không thể tải bài đăng. Vui lòng thử lại sau.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='max-w-7xl mx-auto px-4 py-6 bg-gradient-to-br from-purple-50 via-white to-blue-50 min-h-screen'>
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Main Post - 2 columns on large screens */}
        <div className='lg:col-span-2'>
          <Card className='border-2 border-purple-100 shadow-xl hover:shadow-2xl transition-shadow duration-300 overflow-hidden'>
            <div className='h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500'></div>
            <CardHeader className='bg-gradient-to-r from-purple-50 to-pink-50'>
              <CardTitle className='text-3xl mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-bold'>
                {post.title}
              </CardTitle>
              <div className='flex items-center gap-4 text-sm'>
                <div className='flex items-center gap-2 px-3 py-1.5 bg-purple-100 rounded-full'>
                  <User className='h-4 w-4 text-purple-600' />
                  <span className='font-medium text-purple-700'>{post.name || 'Người dùng'}</span>
                </div>
                <div className='flex items-center gap-2 px-3 py-1.5 bg-blue-100 rounded-full'>
                  <Calendar className='h-4 w-4 text-blue-600' />
                  <time className='font-medium text-blue-700'>
                    {formatDistanceToNow(new Date(post.createdAt), { locale: vi, addSuffix: true })}
                  </time>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className='space-y-4 p-6'>
              {/* Image */}
              {post.imageUrl && (
                <div className='w-full rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border-4 border-gradient-to-r from-purple-200 to-pink-200'>
                  <img 
                    src={post.imageUrl} 
                    alt={post.title}
                    className='w-full h-auto object-cover hover:scale-105 transition-transform duration-500'
                  />
                </div>
              )}
              
              {/* Content */}
              <div 
                className='prose max-w-none prose-headings:text-gray-800 prose-p:text-gray-700 prose-a:text-purple-600 prose-strong:text-purple-700' 
                dangerouslySetInnerHTML={{ __html: post.content || '' }} 
              />
              
              {/* File attachment */}
              {post.fileName && !post.imageUrl && (
                <div className='flex items-center gap-2 p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl border-2 border-purple-200 hover:shadow-lg transition-shadow duration-300'>
                  <div className='p-2 bg-purple-500 rounded-lg'>
                    <FileIcon className='h-5 w-5 text-white' />
                  </div>
                  <span className='text-sm font-medium text-purple-700'>{post.fileName}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Like and Comment Section - 1 column, sticky on large screens */}
        <div className='lg:col-span-1'>
          <div className='lg:sticky lg:top-6'>
            <Card className='border-2 border-blue-100 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden'>
              <div className='h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500'></div>
              <CardContent className='pt-6 space-y-4 bg-gradient-to-br from-blue-50 to-purple-50'>
                {/* Like Button */}
                <div className='flex items-center gap-4'>
                  <Button
                    variant={isLiked ? 'default' : 'outline'}
                    onClick={handleLike}
                    disabled={likePostMutation.isPending || unlikePostMutation.isPending}
                    className={cn(
                      'gap-2 w-full transition-all duration-300 font-semibold',
                      isLiked 
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-105' 
                        : 'border-2 border-purple-300 text-purple-600 hover:bg-purple-50 hover:border-purple-500 hover:scale-105'
                    )}
                  >
                    <ThumbsUp className={cn('h-4 w-4', isLiked && 'animate-bounce')} />
                    {isLiked ? 'Đã thích' : 'Thích'} ({likes})
                  </Button>
                </div>

                <Separator className='bg-gradient-to-r from-transparent via-purple-300 to-transparent h-0.5' />

                {/* Comment Input */}
                <div className='space-y-2'>
                  <Textarea
                    placeholder='Viết bình luận...'
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className='min-h-[100px] border-2 border-purple-200 focus:border-purple-400 focus:ring-purple-400 rounded-lg resize-none transition-colors'
                  />
                  <div className='flex justify-end'>
                    <Button 
                      onClick={handleComment}
                      disabled={commentMutation.isPending || !commentText.trim()}
                      size='sm'
                      className='bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105'
                    >
                      <Send className='h-4 w-4 mr-2' />
                      {commentMutation.isPending ? 'Đang gửi...' : 'Gửi bình luận'}
                    </Button>
                  </div>
                </div>

                <Separator className='bg-gradient-to-r from-transparent via-purple-300 to-transparent h-0.5' />

                {/* Comments List */}
                <div className='space-y-4'>
                  <h3 className='font-bold text-lg flex items-center gap-2 text-purple-700 bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 rounded-lg'>
                    <MessageCircle className='h-5 w-5 text-purple-600' />
                    Bình luận ({comments.length})
                  </h3>
                  
                  {isLoadingComments ? (
                    <div className='flex items-center justify-center py-8'>
                      <Loader2 className='h-6 w-6 animate-spin text-purple-600' />
                    </div>
                  ) : comments.length === 0 ? (
                    <div className='text-center py-8'>
                      <div className='inline-block p-4 bg-purple-100 rounded-full mb-2'>
                        <MessageCircle className='h-8 w-8 text-purple-600' />
                      </div>
                      <p className='text-purple-600 font-medium'>Chưa có bình luận nào</p>
                    </div>
                  ) : (
                    <div className='space-y-4 max-h-[500px] overflow-y-auto pr-2'>
                      {comments.map((comment: any, index: number) => (
                        <div 
                          key={index} 
                          className='flex gap-3 p-3 rounded-lg hover:bg-purple-50 transition-colors duration-200 border-l-4 border-purple-400'
                        >
                          <Avatar className='h-10 w-10 ring-2 ring-purple-300 shadow-md'>
                            <AvatarImage src={comment.avatarUrl} alt={comment.name} />
                            <AvatarFallback className='bg-gradient-to-br from-purple-400 to-pink-400 text-white font-bold'>
                              {comment.name?.charAt(0)?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className='flex-1 space-y-2'>
                            <div className='rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 px-4 py-3 shadow-sm border border-purple-200'>
                              <div className='font-bold text-sm mb-1 text-purple-700'>{comment.name}</div>
                              <div className='text-sm text-gray-700'>{comment.content}</div>
                            </div>
                            <div className='text-xs text-purple-600 font-medium'>
                              {format(new Date(comment.createdAt), 'dd/MM/yyyy HH:mm')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

