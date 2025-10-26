import { countLikeOfPost, getLikeUsersOfPost, getPostRecord, likePost, unlikePost } from '@/apis/like.api'
import { Post } from '@/types/post.type'
import { isImageFile } from '@/utils/utils'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MessageCircleIcon, ThumbsUpIcon, ClockIcon, FileIcon, User, Newspaper } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { UserInfo } from '@/types/like.type'

// Simple Skeleton component
const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn('animate-pulse bg-gray-200 rounded', className)} />
)

interface Props {
  readonly post: Post
}

export default function ItemPost({ post }: Props) {
  const id = post.id
  const [showLikeUsers, setShowLikeUsers] = useState(false)
  const queryClient = useQueryClient()

  const { data: countLikes } = useQuery({
    queryKey: ['count-like-of-posts', id],
    queryFn: () => countLikeOfPost(id),
    enabled: !!id
  })

  const { data: likeRecord } = useQuery({
    queryKey: ['like-record-post-item', id],
    queryFn: () => getPostRecord(id),
    enabled: !!id
  })

  // Fetch users who liked the post when modal is open
  const { data: likeUsersData, isLoading: isLoadingLikeUsers } = useQuery({
    queryKey: ['like-users-post', id],
    queryFn: () => getLikeUsersOfPost(id),
    enabled: !!id && showLikeUsers
  })

  const likeCount = countLikes?.data.data ?? 0
  const isLiked = likeRecord?.data.data && likeRecord.data.data.length > 0
  const likeUsers = likeUsersData?.data?.data || []

  const likePostMutation = useMutation({
    mutationFn: () => likePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['count-like-of-posts', id] })
      queryClient.invalidateQueries({ queryKey: ['like-record-post-item', id] })
    }
  })

  const unlikePostMutation = useMutation({
    mutationFn: () => unlikePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['count-like-of-posts', id] })
      queryClient.invalidateQueries({ queryKey: ['like-record-post-item', id] })
    }
  })

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isLiked) {
      unlikePostMutation.mutate()
    } else {
      likePostMutation.mutate()
    }
  }

  const handleDialogOpenChange = (open: boolean) => {
    // Ngăn chặn sự kiện lan truyền khi đóng modal
    if (!open) {
      setTimeout(() => setShowLikeUsers(false), 0)
    } else {
      setShowLikeUsers(true)
    }
  }

  const renderPostContent = () => (
    <>
      <div className='aspect-[16/9] overflow-hidden bg-gray-100'>
        {post.imageUrl ? (
          <img
            src={post.imageUrl}
            alt={post.title}
            className='w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300'
          />
        ) : post.fileName && isImageFile(post.fileName) ? (
          <img
            src={post.fileName}
            alt={post.title}
            className='w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300'
          />
        ) : post.fileName ? (
          <div className='w-full h-full flex items-center justify-center bg-gray-100'>
            <div className='p-4 flex items-center gap-2'>
              <FileIcon className='h-10 w-10 text-gray-500' />
              <span className='text-sm text-gray-700 truncate max-w-[200px]'>{post.fileName}</span>
            </div>
          </div>
        ) : (
          <div className='w-full h-full bg-gradient-to-br from-purple-100 via-pink-100 to-rose-100 flex items-center justify-center'>
            <Newspaper className='w-16 h-16 text-purple-300' strokeWidth={1} />
          </div>
        )}
      </div>

      <div className='p-4 space-y-3'>
        <h3 className='text-base font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors mb-2 text-gray-800'>
          {post.title}
        </h3>

        <div className='flex items-center justify-between text-sm text-gray-600'>
          <span className='font-medium flex items-center gap-1.5'>
            <User className='w-4 h-4 text-purple-500' strokeWidth={2} />
            {post.name}
          </span>
          <div className='flex items-center text-gray-500 text-xs'>
            <ClockIcon className='size-4 mr-1 text-purple-500' strokeWidth={2} />
            <time>{formatDistanceToNow(new Date(post.createdAt), { locale: vi, addSuffix: true })}</time>
          </div>
        </div>

        <div className='flex items-center space-x-4 text-sm text-gray-600 pt-2 border-t border-gray-100'>
          <div 
            className={cn(
              'flex items-center space-x-1.5 cursor-pointer transition-colors px-2 py-1 rounded-md',
              isLiked 
                ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
                : 'hover:text-purple-600 hover:bg-purple-50'
            )}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleLike(e)
            }}
          >
            <ThumbsUpIcon className='size-4' fill={isLiked ? 'currentColor' : 'none'} />
            <span>{likeCount}</span>
          </div>

          <div 
            className='flex items-center space-x-1.5 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors'
            onClick={(e) => {
              e.preventDefault()
              setShowLikeUsers(true)
            }}
          >
            <MessageCircleIcon className='size-4' />
            <span>{post.totalComments}</span>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <>
      <Link to={`/posts/${post.id}`}>
        <div className='group relative bg-white rounded-lg border border-gray-100 hover:border-primary/40 transition-all duration-300 shadow-sm hover:shadow-md hover:shadow-primary/5 hover:-translate-y-0.5 overflow-hidden'>
          {/* Gradient border on hover */}
          <div className='absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/0 via-pink-500/0 to-rose-500/0 group-hover:from-purple-500/5 group-hover:via-pink-500/5 group-hover:to-rose-500/5 transition-all duration-300 pointer-events-none'></div>

          <div className='relative'>
            {renderPostContent()}
          </div>
        </div>
      </Link>

      <Dialog open={showLikeUsers} onOpenChange={handleDialogOpenChange}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Người đã thích bài viết</DialogTitle>
          </DialogHeader>

          <div className='max-h-[300px] overflow-y-auto'>
            {isLoadingLikeUsers ? (
              <div className='space-y-3 p-2'>
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className='flex items-center gap-3'>
                    <Skeleton className='h-10 w-10 rounded-full' />
                    <div>
                      <Skeleton className='h-4 w-32 mb-2' />
                      <Skeleton className='h-3 w-20' />
                    </div>
                  </div>
                ))}
              </div>
            ) : likeUsers && likeUsers.length > 0 ? (
              <div className='space-y-3 p-2'>
                {likeUsers.map((user: UserInfo) => (
                  <div key={user.id} className='flex items-center gap-3'>
                    <Avatar>
                      <AvatarImage src={user.avatarUrl} />
                      <AvatarFallback>{user.fullName?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className='font-medium'>{user.fullName || 'Người dùng'}</p>
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
    </>
  )
}
