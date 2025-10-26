import { getPosts } from '@/apis/post.api'
import { exportData } from '@/apis/export.api'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Post } from '@/types/post.type'
import path from '@/constants/path'
import usePostQueryConfig from '@/hooks/usePostQueryConfig'
import DialogAddPost from '@/pages/Manage/ManagePost/components/DialogAddPost'
import { Download, FileIcon, User } from 'lucide-react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useSearchParams, Link } from 'react-router-dom'
import { format } from 'date-fns'

// Export Button Component
function ExportCustom({ dataType, queryConfig }: { dataType: string; queryConfig: any }) {
  const exportMutation = useMutation({
    mutationFn: (params: any) => exportData(params)
  })

  const handleExport = (exportType: string) => {
    exportMutation.mutate({
      ...queryConfig,
      dataType,
      exportType
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size='sm' disabled={exportMutation.isPending}>
          <Download className='mr-2 h-4 w-4' />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleExport('pdf')}>Export pdf</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('csv')}>Export excel</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Post Item Component
function PostItem({ post }: { post: Post }) {
  return (
    <Card className='mb-4'>
      <CardHeader>
        <div className='flex items-start justify-between'>
          <CardTitle className='text-lg'>{post.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className='flex items-start gap-4 mb-4'>
          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
            <User className='h-4 w-4' />
            <span>{post.name}</span>
          </div>
          <span className='text-sm text-muted-foreground'>
            {format(new Date(post.createdAt), 'dd/MM/yyyy HH:mm')}
          </span>
        </div>
        <div className='prose max-w-none' dangerouslySetInnerHTML={{ __html: post.content }} />
        {post.fileName && (
          <div className='mt-4 flex items-center gap-2 text-sm text-primary'>
            <FileIcon className='h-4 w-4' />
            <span>{post.fileName}</span>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Link to={`${path.postDetail.replace(':id', String(post.id))}`}>
          <Button variant='outline' size='sm'>
            Xem chi tiết
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

export default function ManagePost() {
  const postQueryConfig = usePostQueryConfig()
  const [searchParams] = useSearchParams()
  const currentPage = Number(searchParams.get('page')) || 1
  
  const { data: posts } = useQuery({
    queryKey: ['posts', postQueryConfig],
    queryFn: () => getPosts(postQueryConfig)
  })

  const totalPages = posts?.data.data.totalPages || 0

  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    return `${path.managePost}?${params.toString()}`
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='font-semibold text-lg'>Bài đăng</h1>
          <p className='text-sm italic'>Quản lý bài đăng</p>
        </div>
        <div className='flex items-center space-x-2'>
          <DialogAddPost />
          <ExportCustom dataType='post' queryConfig={postQueryConfig} />
        </div>
      </div>
      <div className='bg-background'>
        {posts?.data.data.content.map((post, index) => <PostItem key={index} post={post} />)}
      </div>
      <div className='flex justify-center'>
        <Pagination>
          <PaginationContent>
            {currentPage > 1 && (
              <PaginationItem>
                <PaginationPrevious
                  to={buildPageUrl(currentPage - 1)}
                  disabled={currentPage === 1}
                />
              </PaginationItem>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  to={buildPageUrl(page)}
                  isActive={currentPage === page}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            {currentPage < totalPages && (
              <PaginationItem>
                <PaginationNext
                  to={buildPageUrl(currentPage + 1)}
                  disabled={currentPage === totalPages}
                />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}
