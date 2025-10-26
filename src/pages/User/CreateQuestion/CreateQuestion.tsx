/* eslint-disable @typescript-eslint/no-explicit-any */
import { BookOpen, Clock3, AlertCircle, HelpCircle, Building2, Paperclip, X } from 'lucide-react'
import { useState, useEffect, useMemo, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'

import { getAllDepartments, getFields, getRolesAsk } from '@/apis/department.api'
import { createNewQuestion } from '@/apis/question.api'
import { CreateQuestionRequest } from '@/types/question.type'
import { FormControlItem } from '@/types/utils.type'
import { generateSelectionData } from '@/utils/utils'
import path from '@/constants/path'
import { toast } from 'sonner'
import useQuestionQueryConfig, { QuestionQueryConfig } from '@/hooks/useQuestionQueryConfig'
import * as yup from 'yup'
import { debounce } from 'lodash'

// Schema cho form đã loại bỏ thông tin cá nhân (backend tự lấy từ user đăng nhập)
const FormSchema = yup.object({
  departmentId: yup.string().required('Bạn phải chọn đơn vị'),
  fieldId: yup.string().required('Bạn phải chọn lĩnh vực'),
  roleAsk: yup.string().required('Bạn phải chọn vai trò'),
  title: yup.string().required('Bạn phải nhập tiêu đề câu hỏi'),
  content: yup
    .string()
    .required('Bạn chưa nhập nội dung cần tư vấn')
    .notOneOf(['<p><br></p>'], 'Bạn chưa nhập nội dung cần tư vấn'),
  statusPublic: yup.boolean()
})

type FormData = yup.InferType<typeof FormSchema>

const quillModules = {
  toolbar: [
    [{ font: [] }, { size: [] }],
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ script: 'sub' }, { script: 'super' }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ align: [] }],
    ['link'],
    ['code-block'],
    ['clean']
  ]
}

export default function CreateQuestion() {
  const [showRecommendationsPopup, setShowRecommendationsPopup] = useState<boolean>(false)
  const [recommendations, setRecommendations] = useState<any>()
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null)
  const [file, setFile] = useState<File>()
  const [previewImage, setPreviewImage] = useState<string>('')

  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const queryConfig: QuestionQueryConfig = useQuestionQueryConfig()
  const editorRef = useRef<HTMLDivElement>(null)

  const form = useForm<FormData>({
    defaultValues: {
      departmentId: '',
      fieldId: '',
      roleAsk: '',
      title: '',
      content: '',
      statusPublic: true
    },
    resolver: yupResolver(FormSchema)
  })

  // File preview effect
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewImage(url)
      return () => URL.revokeObjectURL(url)
    } else {
      setPreviewImage('')
    }
  }, [file])

  // API queries
  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: getAllDepartments
  })

  const departmentId = form.watch('departmentId')
  const { data: fields } = useQuery({
    queryKey: ['fields', departmentId],
    queryFn: () => getFields(departmentId),
    enabled: !!departmentId
  })

  const { data: rolesAsk } = useQuery({
    queryKey: ['rolesAsk'],
    queryFn: getRolesAsk
  })


  // Generate selection data
  const departmentsSelectionData: FormControlItem[] | undefined = useMemo(() => {
    const data = departments?.data.data
    return generateSelectionData(data)
  }, [departments])

  const fieldsSelectionData: FormControlItem[] | undefined = useMemo(() => {
    const data = fields?.data.data
    return generateSelectionData(data)
  }, [fields])

  const roleAskSelectionData: FormControlItem[] | undefined = useMemo(() => {
    const data = rolesAsk?.data.data
    return data?.map((item: any) => ({
      value: item.name, // Sử dụng name làm value
      label: item.description // Hiển thị description trong dropdown
    }))
  }, [rolesAsk])


  // Mutations
  const createQuestionMutation = useMutation({
    mutationFn: ({ params, file }: { params: CreateQuestionRequest; file?: File }) => createNewQuestion(params, file)
  })

  // Recommendations state and logic
  const [recData, setRecData] = useState<any[]>([])
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false)
  const debouncedFnRef = useRef<any>(null)

  // Hàm gọi API thực tế
  const fetchRecommendationsApi = async (text: string) => {
    if (!text.trim()) {
      setRecData([])
      return
    }

    setIsLoadingRecommendations(true)
    try {
      const response = await fetch(
        `${import.meta.env.VITE_AI_URL}/recommend?text=${encodeURIComponent(text.trim())}`
      )
      const data = await response.json()
      
      if (data && data.status === 'success' && Array.isArray(data.data)) {
        setRecData(data.data)
      } else {
        setRecData([])
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error)
      setRecData([])
    } finally {
      setIsLoadingRecommendations(false)
    }
  }

  // Tạo hàm debounced
  useEffect(() => {
    debouncedFnRef.current = debounce(fetchRecommendationsApi, 2000, {
      leading: false,
      trailing: true
    })

    return () => {
      if (debouncedFnRef.current) {
        debouncedFnRef.current.cancel()
      }
    }
  }, [])

  const handleContentChange = (content: string) => {
    const plainText = content.replace(/<[^>]+>/g, '')
    
    if (debouncedFnRef.current) {
      debouncedFnRef.current(plainText)
    }

    if (plainText.length > 10 && recData.length > 0) {
      setShowRecommendationsPopup(true)
    }
  }

  useEffect(() => {
    setRecommendations(recData)
  }, [recData])

  const onSubmit = form.handleSubmit((values) => {
    values.content = `<div class="editor">${values.content}</div>`
    
    // Backend sẽ tự lấy thông tin user từ token, không cần gửi thông tin cá nhân
    const params = values as CreateQuestionRequest
    
    createQuestionMutation.mutate(
      { params, file },
      {
        onSuccess: (res) => {
          toast.success(res.data.message)
          queryClient.invalidateQueries({
            queryKey: ['questions', queryConfig]
          })
          navigate(path.home)
        },
        onError: (error) => {
          toast.error('Có lỗi xảy ra khi gửi câu hỏi')
        }
      }
    )
  })

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileFromLocal = event.target.files?.[0]
    if (fileFromLocal && fileFromLocal.size > 10 * 1024 * 1024) {
      toast.error('File không được vượt quá 10MB')
      return
    }
    setFile(fileFromLocal)
  }

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    event.stopPropagation()
  }

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    event.stopPropagation()

    const droppedFile = event.dataTransfer.files[0]
    if (droppedFile) {
      if (droppedFile.size > 10 * 1024 * 1024) {
        toast.error('File không được vượt quá 10MB')
        return
      }
      setFile(droppedFile)
    }
  }

  return (
    <div className='w-full min-h-screen py-8 px-4'>
      <div className='space-y-6 mt-8'>
        <div className='max-w-2xl mx-auto text-center mb-10'>
          <div className='flex justify-center mb-4'>
            <div className='bg-primary/10 p-3 rounded-full'>
              <HelpCircle className='w-6 h-6 text-primary' />
            </div>
          </div>
          <h1 className='text-2xl font-semibold text-foreground mb-2'>Trung tâm hỗ trợ sinh viên</h1>
          <p className='text-sm text-secondary-foreground'>
            Chúng tôi luôn sẵn sàng lắng nghe và giải đáp mọi thắc mắc của bạn
          </p>
        </div>

        <div className='max-w-6xl mx-auto'>
          <div className='grid lg:grid-cols-12 gap-6'>
          {/* Sidebar Information */}
            <div className='lg:col-span-4 space-y-4'>
            {/* Guidelines Card */}
            <Card>
              <CardContent className='p-5'>
              <div className='space-y-4'>
                <div className='flex gap-3'>
                  <BookOpen className='w-5 h-5 text-primary shrink-0 mt-0.5' />
                  <div>
                    <p className='text-sm text-secondary-foreground'>
                      Các vấn đề: học tập, học bổng, chính sách sinh viên...
                    </p>
                  </div>
                </div>
                <div className='flex gap-3'>
                  <Clock3 className='w-5 h-5 text-primary shrink-0 mt-0.5' />
                  <div>
                    <p className='text-sm text-secondary-foreground'>
                      Thời gian phản hồi: <span className='font-medium'>1-2 ngày làm việc</span>
                    </p>
                  </div>
                </div>
              </div>
              </CardContent>
            </Card>

            {/* Warning Card */}
            <Card className='border-destructive bg-destructive/5'>
              <CardContent className='p-5'>
              <div className='flex gap-3'>
                  <AlertCircle className='w-5 h-5 text-destructive shrink-0 mt-0.5' />
                  <p className='text-sm text-destructive'>
                  Không đặt câu hỏi có nội dung không phù hợp. Tài khoản vi phạm sẽ bị khóa.
                </p>
              </div>
              </CardContent>
            </Card>

            {/* Recommendations Popup */}
            {showRecommendationsPopup && recommendations?.length > 0 && (
              <Card className='z-50 animate-fadeIn'>
                <CardHeader className='pb-3'>
                  <div className='flex justify-between items-center'>
                    <div className='flex items-center gap-2'>
                      <HelpCircle className='w-5 h-5 text-primary' />
                      <CardTitle className='text-lg text-primary'>Câu hỏi tương tự</CardTitle>
                    </div>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => setShowRecommendationsPopup(false)}
                      className='h-8 w-8 p-0'
                    >
                      <X className='h-4 w-4' />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className='p-0'>
                  {/* Warning Message */}
                  <div className='p-4 bg-yellow-50 border-b border-yellow-100'>
                    <div className='flex items-start gap-3'>
                      <AlertCircle className='w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5' />
                      <div>
                        <p className='text-sm text-yellow-800 font-medium'>Lưu ý quan trọng</p>
                        <p className='text-sm text-yellow-700 mt-1'>
                          Nếu bạn tìm thấy câu hỏi tương tự phù hợp với thắc mắc của mình, vui lòng xem xét câu trả lời
                          trước khi đặt câu hỏi mới để tránh trùng lặp.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <ScrollArea className='h-[400px]'>
                    <div className='divide-y divide-muted'>
                      {recommendations.map((rec: any, index: any) => (
                        <Button
                          key={index}
                          variant='ghost'
                          onClick={() => setSelectedQuestion(rec)}
                          className='w-full justify-start p-4 h-auto hover:bg-muted/50 transition-all duration-200 ease-in-out group'
                        >
                          <div className='flex items-start gap-3 w-full'>
                            <Badge variant='secondary' className='flex-shrink-0 w-8 h-8 rounded-full p-0 flex items-center justify-center'>
                              {index + 1}
                            </Badge>
                            <div className='flex-1 text-left'>
                              <div
                                className='prose prose-sm max-w-none group-hover:text-primary transition-colors'
                                dangerouslySetInnerHTML={{ __html: rec.question }}
                              />
                              {rec.answer && (
                                <div
                                  className='mt-2 text-sm text-muted-foreground line-clamp-2'
                                  dangerouslySetInnerHTML={{ __html: rec.answer }}
                                />
                              )}
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>

                  {/* Footer */}
                  <div className='p-4 border-t border-muted bg-muted/10 flex justify-between items-center'>
                    <span className='text-sm text-muted-foreground'>
                      Tìm thấy {recommendations.length} câu hỏi tương tự
                    </span>
                    <Button
                      onClick={() => setShowRecommendationsPopup(false)}
                      size='sm'
                    >
                      Đóng
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Question Detail Modal */}
            <Dialog open={!!selectedQuestion} onOpenChange={() => setSelectedQuestion(null)}>
              <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto'>
                <DialogHeader>
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center'>
                      <HelpCircle className='w-6 h-6 text-primary' />
                    </div>
                    <div>
                      <DialogTitle className='text-xl'>Chi tiết câu hỏi</DialogTitle>
                      <DialogDescription>Xem thông tin chi tiết về câu hỏi và câu trả lời</DialogDescription>
                    </div>
                  </div>
                </DialogHeader>

                <div className='space-y-8 py-4'>
                  {/* Question Section */}
                  <div className='relative pl-8 border-l-2 border-muted'>
                    <div className='absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-background border-2 border-muted'></div>
                    <div className='space-y-2'>
                      <div className='flex items-center gap-2'>
                        <h4 className='text-sm font-medium text-muted-foreground'>Câu hỏi</h4>
                        <span className='text-xs text-muted-foreground/70'>•</span>
                        <span className='text-xs text-muted-foreground'>Từ người dùng</span>
                      </div>
                      <div className='prose prose-sm max-w-none'>
                        <div
                          className='text-foreground'
                          dangerouslySetInnerHTML={{ __html: selectedQuestion?.question }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Answer Section */}
                  {selectedQuestion?.answer && (
                    <div className='relative pl-8 border-l-2 border-muted'>
                      <div className='absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-background border-2 border-muted'></div>
                      <div className='space-y-2'>
                        <div className='flex items-center gap-2'>
                          <h4 className='text-sm font-medium text-muted-foreground'>Câu trả lời</h4>
                          <span className='text-xs text-muted-foreground/70'>•</span>
                          <span className='text-xs text-muted-foreground'>Từ tư vấn viên</span>
                        </div>
                        <div className='prose prose-sm max-w-none'>
                          <div
                            className='text-foreground'
                            dangerouslySetInnerHTML={{ __html: selectedQuestion.answer }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <Button
                    onClick={() => setSelectedQuestion(null)}
                    className='flex items-center gap-2'
                  >
                    <X className='h-4 w-4' />
                    Đóng
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Main Form Section */}
            <div className='lg:col-span-8'>
            <Card>
              <CardContent className='p-6'>
                <Form {...form}>
                  <form onSubmit={onSubmit} className='space-y-6'>
                    {/* Department Selection Section */}
                    <div className='space-y-4'>
                      <div className='flex gap-2 items-start'>
                        <Building2 className='w-5 h-5 text-primary shrink-0 mt-0.5' />
                        <div>
                          <Label className='text-md'>Chọn đơn vị tiếp nhận</Label>
                          <p className='text-xs text-muted-foreground'>Vui lòng chọn đúng đơn vị để được hỗ trợ nhanh nhất</p>
                        </div>
                      </div>
                      <div className='grid gap-4 md:grid-cols-2'>
                        <FormField
                          control={form.control}
                          name='departmentId'
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Đơn vị tiếp nhận <span className='text-destructive'>*</span></FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder='Chọn phòng/khoa...' />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="z-50 bg-background border border-border shadow-lg">
                                  {departmentsSelectionData?.map((item) => (
                                    <SelectItem key={item.value} value={String(item.value)} className="hover:bg-accent">
                                      {item.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name='fieldId'
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Lĩnh vực <span className='text-destructive'>*</span></FormLabel>
                              <Select onValueChange={field.onChange} value={field.value} disabled={!departmentId}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder='Chọn lĩnh vực cụ thể...' />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="z-50 bg-background border border-border shadow-lg">
                                  {fieldsSelectionData?.map((item) => (
                                    <SelectItem key={item.value} value={String(item.value)} className="hover:bg-accent">
                                      {item.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name='roleAsk'
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Vai trò của bạn <span className='text-destructive'>*</span></FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder='Bạn đang là...' />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="z-50 bg-background border border-border shadow-lg">
                                  {roleAskSelectionData?.map((item) => (
                                    <SelectItem key={item.value} value={String(item.value)} className="hover:bg-accent">
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
                    </div>

                    <Separator />

                    {/* Question Content Section */}
                    <div className='space-y-4'>
                      <div className='flex gap-2 items-start'>
                        <HelpCircle className='w-5 h-5 text-primary shrink-0 mt-0.5' />
                        <div>
                          <Label className='text-md'>Nội dung câu hỏi</Label>
                          <p className='text-xs text-muted-foreground'>Hãy mô tả chi tiết vấn đề của bạn</p>
                        </div>
                      </div>
                      <div className='space-y-4'>
                        <FormField
                          control={form.control}
                          name='title'
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tiêu đề câu hỏi <span className='text-destructive'>*</span></FormLabel>
                              <FormControl>
                                <Input placeholder='Tóm tắt ngắn gọn vấn đề của bạn' {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name='content'
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Chi tiết câu hỏi <span className='text-destructive'>*</span></FormLabel>
                              <FormControl>
                                <div ref={editorRef}>
                                  <ReactQuill
                                    theme='snow'
                                    value={field.value}
                                    onChange={(content) => {
                                      field.onChange(content)
                                      handleContentChange(content)
                                    }}
                                    className='bg-background text-foreground'
                                    modules={quillModules}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Attachment Section */}
                    <div className='space-y-4'>
                      <div className='flex gap-2 items-start'>
                        <Paperclip className='w-5 h-5 text-primary shrink-0 mt-0.5' />
                        <div>
                          <Label className='text-md'>Tài liệu đính kèm</Label>
                          <p className='text-xs text-muted-foreground'>Thêm hình ảnh hoặc tài liệu minh họa (nếu cần)</p>
                        </div>
                      </div>
                      <div className='space-y-4'>
                        <div className='flex items-center justify-center w-full'>
                          <label
                            className='flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-secondary-foreground rounded-lg cursor-pointer bg-secondary/50 hover:bg-secondary/80'
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                          >
                            <div className='flex flex-col items-center justify-center pt-5 pb-6'>
                              <Paperclip className='w-8 h-8 mb-3 text-secondary-foreground/80' />
                              <p className='text-sm text-secondary-foreground'>
                                <span className='font-medium'>Click để tải file</span> hoặc kéo thả
                              </p>
                              <p className='text-xs text-secondary-foreground'>Chỉ chấp nhận file ảnh (Max. 10MB)</p>
                            </div>
                            <Input
                              id='file'
                              type='file'
                              className='hidden'
                              onChange={handleFileChange}
                              accept='image/*'
                            />
                          </label>
                        </div>
                        {previewImage && (
                          <div className='flex items-center justify-center rounded-md cursor-pointer'>
                            <img
                              src={previewImage}
                              alt='preview'
                              className='max-w-full max-h-48 rounded-md'
              />
            </div>
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* Form Footer */}
                    <div className='flex items-center justify-between bg-secondary/50 p-4 rounded-lg'>
                      <FormField
                        control={form.control}
                        name='statusPublic'
                        render={({ field }) => (
                          <FormItem className='flex items-center space-x-2'>
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel className='!mt-0'>Cho phép hiển thị công khai</FormLabel>
                          </FormItem>
                        )}
                      />
                      <Button
                        type='submit'
                        disabled={createQuestionMutation.isPending}
                        className='px-6'
                      >
                        {createQuestionMutation.isPending ? 'Đang gửi...' : 'Gửi câu hỏi'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
