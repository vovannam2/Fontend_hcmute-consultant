import { getComments } from '@/apis/comment.api.ts'
import { getPostDetail } from '@/apis/post.api'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useQuery } from '@tanstack/react-query'
import { FileIcon, MessageCircle, User, Calendar, Loader2 } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { format } from 'date-fns'

export default function PostDetail() {
  const { id } = useParams()
  const postId = id as string

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

  const post = postResponse?.data.data
  const comments = commentsResponse?.data.data || []

  // Loading state
  if (isLoadingPost) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    )
  }

  // Error state
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
    <div className='p-6'>
      <div className='grid grid-cols-12 gap-4'>
        {/* Phần nội dung bài đăng */}
        <div className='col-span-8'>
          <Card>
            <CardHeader>
              <div className='flex items-start justify-between mb-4'>
                <CardTitle className='text-2xl'>{post?.title}</CardTitle>
                <Badge variant={post?.approved ? 'default' : 'secondary'}>
                  {post?.approved ? 'Đã duyệt' : 'Chưa duyệt'}
                </Badge>
              </div>
              <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                <div className='flex items-center gap-2'>
                  <User className='h-4 w-4' />
                  <span>{post?.name || 'Người dùng'}</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Calendar className='h-4 w-4' />
                  <span>{post?.createdAt ? format(new Date(post.createdAt), 'dd/MM/yyyy HH:mm') : ''}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              {/* Hiển thị ảnh nếu có */}
              {post?.imageUrl && (
                <div className='w-full'>
                  <img 
                    src={post.imageUrl} 
                    alt={post.title}
                    className='w-full h-auto rounded-lg'
                  />
                </div>
              )}
              
              <div 
                className='prose max-w-none' 
                dangerouslySetInnerHTML={{ __html: post?.content || '' }} 
              />
              
              {post?.fileName && (
                <div className='flex items-center gap-2 p-3 bg-secondary rounded-lg'>
                  <FileIcon className='h-5 w-5 text-primary' />
                  <span className='text-sm'>{post.fileName}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Phần bình luận */}
        <div className='col-span-4'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <MessageCircle className='h-5 w-5' />
                <span>Bình luận ({comments.length})</span>
              </CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className='mt-4'>
              {isLoadingComments ? (
                <div className='flex items-center justify-center py-8'>
                  <Loader2 className='h-6 w-6 animate-spin text-primary' />
                </div>
              ) : (
                <div className='space-y-4 max-h-[600px] overflow-y-auto'>
                  {comments.length === 0 ? (
                    <p className='text-center text-muted-foreground py-4'>Chưa có bình luận nào</p>
                  ) : (
                    comments.map((comment: any, index: number) => (
                      <div key={index} className='flex gap-3'>
                        <Avatar className='h-8 w-8'>
                          <AvatarImage src={comment.avatarUrl} alt={comment.name} />
                          <AvatarFallback>
                            {comment.name?.charAt(0)?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className='flex-1'>
                          <div className='rounded-2xl bg-secondary text-secondary-foreground px-4 py-2'>
                            <div className='font-bold text-sm'>{comment.name}</div>
                            <div className='text-sm mt-1'>{comment.content}</div>
                          </div>
                          <div className='text-[10px] ml-4 mt-1 text-muted-foreground'>
                            {format(new Date(comment.createdAt), 'dd/MM/yyyy HH:mm')}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
