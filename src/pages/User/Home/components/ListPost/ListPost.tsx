import { getPublicPosts } from '@/apis/post.api'
import { Button } from '@/components/ui/button'
import usePostQueryConfig from '@/hooks/usePostQueryConfig'
import ItemPost from '@/pages/User/Home/components/ListPost/components/ConsultActivity/ItemPost'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Newspaper } from 'lucide-react'

export default function ListPost() {
  const postQueryConfig = usePostQueryConfig()
  
  const { data: posts, isLoading, isError } = useQuery({
    queryKey: ['public-posts', postQueryConfig],
    queryFn: () => getPublicPosts(postQueryConfig),
    refetchOnWindowFocus: false
  })

  const [isShowAll, setIsShowAll] = useState<boolean>(false)
  const postsData = useMemo(() => {
    const content = posts?.data.data.content || []
    if (!isShowAll) return content.slice(0, 2)
    return content
  }, [isShowAll, posts])
  
  return (
    <div className='relative overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 border border-purple-100 rounded-xl shadow-lg'>
      {/* Decorative background pattern */}
      <div className='absolute inset-0 bg-[url("/grid-pattern.svg")] opacity-5'></div>
      
      {/* Header */}
      <div className='relative px-4 py-3 border-b border-purple-100 bg-gradient-to-r from-purple-500/10 to-pink-500/10'>
        <div className='flex items-center gap-3'>
          <div className='p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 shadow-md'>
            <Newspaper className='w-5 h-5 text-white' strokeWidth={2} />
          </div>
          <div>
            <h3 className='font-semibold text-foreground'>Bài viết nổi bật</h3>
            <p className='text-xs text-muted-foreground'>Các bài viết được quan tâm</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='relative p-4'>
        {isLoading ? (
          <div className='space-y-3'>
            {[1, 2].map((i) => (
              <div key={i} className='animate-pulse bg-gray-200 h-40 rounded-lg' />
            ))}
          </div>
        ) : isError ? (
          <div className='flex items-center justify-center py-8'>
            <div className='text-center'>
              <p className='text-sm text-red-500'>Lỗi tải dữ liệu</p>
            </div>
          </div>
        ) : postsData && postsData.length > 0 ? (
          <>
            <ul className='space-y-3'>
              {postsData.map((post) => (
                <ItemPost key={post.id} post={post} />
              ))}
            </ul>
            {posts?.data.data.content && posts.data.data.content.length > 2 && (
              <div className='flex items-center justify-center mt-3'>
                <Button
                  variant='outline'
                  className='bg-white border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 px-4 h-9 text-xs flex items-center gap-2'
                  onClick={() => setIsShowAll((prev) => !prev)}
                >
                  {isShowAll ? (
                    <>
                      <svg className='h-4 w-4' fill='none' stroke='currentColor' strokeWidth={2} viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' d='M5 15l7-7 7 7'></path>
                      </svg>
                      Thu gọn
                    </>
                  ) : (
                    <>
                      <svg className='h-4 w-4' fill='none' stroke='currentColor' strokeWidth={2} viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' d='M19 9l-7 7-7-7'></path>
                      </svg>
                      Xem thêm ({posts.data.data.content.length - 2})
                    </>
                  )}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className='flex items-center justify-center py-8'>
            <div className='text-center'>
              <Newspaper className='w-10 h-10 text-gray-300 mx-auto mb-2' strokeWidth={1.5} />
              <p className='text-sm text-gray-500'>Chưa có bài viết nổi bật</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
