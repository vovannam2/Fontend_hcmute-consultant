import { createPost } from '@/apis/post.api'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { PostRequest } from '@/types/post.type'
import { AddPostSchema } from '@/utils/rules'
import { yupResolver } from '@hookform/resolvers/yup'
import { PlusIcon, FileIcon, X } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'

type FormData = yup.InferType<typeof AddPostSchema>

export default function DialogAddPost() {
  const [open, setOpen] = useState<boolean>(false)
  const [file, setFile] = useState<File>()
  
  const previewImage = useMemo(() => {
    return file ? URL.createObjectURL(file) : ''
  }, [file])

  const form = useForm<FormData>({
    defaultValues: {
      title: '',
      content: ''
    },
    resolver: yupResolver(AddPostSchema)
  })

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileFromLocal = event.target.files?.[0]
    setFile(fileFromLocal)
  }

  const handleRemoveFile = () => {
    setFile(undefined)
  }

  const isImageFile = (file: File) => {
    return file.type.startsWith('image/')
  }

  const createPostMutation = useMutation({
    mutationFn: (body: PostRequest) => createPost(body)
  })

  const onSubmit = form.handleSubmit((values) => {
    values.content = `<div class="editor">${values.content}</div>`
    const body: PostRequest = {
      ...values,
      anonymous: false,
      approved: true,
      file: file as File
    }
    createPostMutation.mutate(body, {
      onSuccess: (res) => {
        toast.success(res.data.message)
        setOpen(false)
        form.reset()
        setFile(undefined)
      }
    })
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size='sm'>
          <PlusIcon />
          <span>Thêm bài đăng</span>
        </Button>
      </DialogTrigger>
      <DialogContent className='min-w-[800px] max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Thêm bài đăng</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className='space-y-4'>
            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiêu đề</FormLabel>
                  <FormControl>
                    <Input placeholder='Tiêu đề' {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='content'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nội dung</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder='Nội dung bài đăng...' 
                      className='min-h-[200px]'
                      {...field} 
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className='space-y-2'>
              <FormLabel>Tệp đính kèm</FormLabel>
              <Input 
                id='file' 
                type='file' 
                onChange={handleFileChange} 
                accept='.doc,.docx,.pdf,image/*' 
              />
              {previewImage && file && (
                <div className='relative mt-2'>
                  <div className='flex items-center gap-2 p-3 border rounded-md'>
                    {isImageFile(file) ? (
                      <div className='relative'>
                        <img src={previewImage} alt='Preview' className='max-w-[200px] max-h-[200px] object-cover rounded' />
                        <button
                          type='button'
                          onClick={handleRemoveFile}
                          className='absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90'
                        >
                          <X className='h-4 w-4' />
                        </button>
                      </div>
                    ) : (
                      <div className='flex items-center gap-2'>
                        <FileIcon className='h-8 w-8 text-muted-foreground' />
                        <span className='text-sm'>{file.name}</span>
                        <button
                          type='button'
                          onClick={handleRemoveFile}
                          className='ml-auto text-destructive hover:text-destructive/90'
                        >
                          <X className='h-4 w-4' />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <Button 
              type='submit' 
              disabled={createPostMutation.isPending}
              className='w-full'
            >
              {createPostMutation.isPending ? 'Đang thêm...' : 'Thêm bài đăng'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
