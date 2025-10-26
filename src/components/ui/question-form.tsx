import { getAllDepartments, getFields, getRolesAsk } from '@/apis/department.api'
import { createNewQuestion, updateQuestion } from '@/apis/question.api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import path from '@/constants/path'
import { toast } from 'sonner'
import useQuestionQueryConfig, { QuestionQueryConfig } from '@/hooks/useQuestionQueryConfig'
import { CreateQuestionRequest, Question } from '@/types/question.type'
import { FormControlItem } from '@/types/utils.type'
import { CreateQuestionSchema } from '@/utils/rules'
import { generateSelectionData } from '@/utils/utils'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { omit } from 'lodash'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import * as yup from 'yup'
import { Building2, UserCircle, HelpCircle, Paperclip } from 'lucide-react'

interface Props {
  readonly question?: Question
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  profileData?: any // Thêm type cụ thể cho profile data
  onUpdateSuccess?: () => void // Callback khi update thành công
}

type FormData = yup.InferType<typeof CreateQuestionSchema>

export default function QuestionForm({
  question,
  profileData,
  onUpdateSuccess
}: Props) {
  const isUpdate = !!question

  const queryClient = useQueryClient()
  const isFormReset = useRef<boolean>(!isUpdate)
  const queryConfig: QuestionQueryConfig = useQuestionQueryConfig()
  const [file, setFile] = useState<File>()
  const previewImage = useMemo(() => {
    const result = file ? URL.createObjectURL(file) : ((question as any)?.fileUrl ?? '')
    return result
  }, [file, (question as any)?.fileUrl])

  const navigate = useNavigate()

  const form = useForm<FormData>({
    defaultValues: {
      departmentId: '',
      fieldId: '',
      roleAsk: '',
      title: '',
      content: '',
      fullName: profileData?.fullName || '',
      statusPublic: true,
      studentCode: profileData?.studentCode || ''
    },
    resolver: yupResolver(CreateQuestionSchema)
  })

  useEffect(() => {
    if (!question && isFormReset.current) return
    
    // Extract text content from HTML
    const extractTextFromHTML = (html: string) => {
      if (!html) return ''
      // Create a temporary div to parse HTML
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = html
      return tempDiv.textContent || tempDiv.innerText || ''
    }
    
    
    form.reset({
      departmentId: (question as any)?.department?.id ? String((question as any).department.id) : '',
      fieldId: (question as any)?.field?.id ? String((question as any).field.id) : '',
      roleAsk: question?.roleAsk ? String(question.roleAsk) : '',
      title: question?.title || '',
      content: extractTextFromHTML(question?.content || ''),
      fullName: (question as any)?.user?.fullName || profileData?.fullName || '',
      statusPublic: true,
      studentCode: (question as any)?.user?.studentCode || profileData?.studentCode || ''
    })
    isFormReset.current = true
  }, [question, profileData])

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: getAllDepartments
  })
  
  // generate selection data
  const departmentsSelectionData: FormControlItem[] | undefined = useMemo(() => {
    const data = departments?.data.data
    return generateSelectionData(data)
  }, [departments])

  const departmentId = form.watch('departmentId')
  const { data: fields } = useQuery({
    queryKey: ['fields', departmentId],
    queryFn: () => getFields(departmentId),
    enabled: !!departmentId
  })

  // generate selection data
  const fieldsSelectionData: FormControlItem[] | undefined = useMemo(() => {
    const data = fields?.data.data
    return generateSelectionData(data)
  }, [fields])

  const { data: rolesAsk } = useQuery({
    queryKey: ['rolesAsk'],
    queryFn: getRolesAsk
  })

  // generate selection data
  const roleAskSelectionData: FormControlItem[] | undefined = useMemo(() => {
    const data = rolesAsk?.data.data
    const result = data?.map((item: any) => {
      return {
        value: String(item.name), // Use name as value to match with question.roleAsk
        label: item.description // Use description as label like CreateQuestion.tsx
      }
    })
    return result
  }, [rolesAsk])

  const createQuestionMutation = useMutation({
    mutationFn: ({ params, file }: { params: CreateQuestionRequest; file?: File }) => createNewQuestion(params, file)
  })

  const updateQuestionMutation = useMutation({
    mutationFn: ({ questionId, params, file }: { questionId: string; params: CreateQuestionRequest; file?: File }) =>
      updateQuestion(questionId, params, file)
  })

  // handle question create process
  const onSubmit = form.handleSubmit((values) => {
    values.content = `<div class="editor">${values.content}</div>`
    const params = omit(values, ['email']) as CreateQuestionRequest
    if (!isUpdate) {
      createQuestionMutation.mutate(
        { params, file },
        {
          onSuccess: (res) => {
            toast.success(res.data.message)

            // refetch query to get new data
            queryClient.invalidateQueries({
              queryKey: ['questions', queryConfig]
            })
            navigate(path.home)
          }
        }
      )
      return
    }
    const questionId = question.id
    updateQuestionMutation.mutate(
      { questionId, params, file },
      {
        onSuccess: (res) => {
          toast.success(res.data.message)

          // refetch query to get new data
          queryClient.invalidateQueries({
            queryKey: ['questions', queryConfig]
          })
          
          // Close dialog if callback provided
          if (onUpdateSuccess) {
            onUpdateSuccess()
          }
        }
      }
    )
  })

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileFromLocal = event.target.files?.[0]
    setFile(fileFromLocal)
  }

  // Thêm hàm xử lý drag and drop
  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    event.stopPropagation()
  }

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    event.stopPropagation()

    const droppedFile = event.dataTransfer.files[0]
    if (droppedFile) {
      // Chỉ kiểm tra kích thước file (10MB = 10 * 1024 * 1024 bytes)
      if (droppedFile.size > 10 * 1024 * 1024) {
        toast.error('File không được vượt quá 10MB')
        return
      }

      setFile(droppedFile)
    }
  }

  return (
    <div className="space-y-6">
      {isFormReset.current && (
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Department Selection Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  Chọn đơn vị tiếp nhận
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Vui lòng chọn đúng đơn vị để được hỗ trợ nhanh nhất
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="departmentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Đơn vị tiếp nhận *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn phòng/khoa..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {departmentsSelectionData?.map((item) => (
                              <SelectItem key={item.value} value={item.value}>
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
                    name="fieldId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lĩnh vực *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn lĩnh vực cụ thể..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {fieldsSelectionData?.map((item) => (
                              <SelectItem key={item.value} value={item.value}>
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
              </CardContent>
            </Card>

            {/* Personal Info Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCircle className="w-5 h-5 text-primary" />
                  Thông tin cá nhân
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Thông tin của bạn sẽ được bảo mật
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Họ và tên *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ví dụ: Nguyễn Văn An" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="roleAsk"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vai trò của bạn *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Bạn đang là..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {roleAskSelectionData?.map((item) => (
                              <SelectItem key={item.value} value={item.value}>
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
                    name="studentCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mã số sinh viên (nếu có)</FormLabel>
                        <FormControl>
                          <Input placeholder="Ví dụ: 21520001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Question Content Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-primary" />
                  Nội dung câu hỏi
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Hãy mô tả chi tiết vấn đề của bạn
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tiêu đề câu hỏi *</FormLabel>
                      <FormControl>
                        <Input placeholder="Tóm tắt ngắn gọn vấn đề của bạn" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chi tiết câu hỏi *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Mô tả chi tiết vấn đề của bạn..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Attachment Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Paperclip className="w-5 h-5 text-primary" />
                  Tài liệu đính kèm
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Thêm hình ảnh hoặc tài liệu minh họa (nếu cần)
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-secondary-foreground rounded-lg cursor-pointer bg-secondary/50 hover:bg-secondary/80"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Paperclip className="w-8 h-8 mb-3 text-secondary-foreground/80" />
                      <p className="text-sm text-secondary-foreground">
                        <span className="font-medium">Click để tải file</span> hoặc kéo thả
                      </p>
                      <p className="text-xs text-secondary-foreground">Chỉ chấp nhận file ảnh (Max. 10MB)</p>
                    </div>
                    <Input
                      id="file"
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      accept="image/*"
                    />
                  </label>
                </div>
                {previewImage && previewImage.trim() !== '' && (
                  <div className="mt-3">
                    <p className="text-sm text-muted-foreground mb-2">📎 Ảnh hiện tại:</p>
                    <img 
                      src={previewImage} 
                      alt="Preview" 
                      className="max-w-full h-auto rounded-lg border"
                      onError={(e) => {
                        console.error('❌ Error loading preview image:', previewImage)
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Form Footer */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FormField
                      control={form.control}
                      name="statusPublic"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Cho phép hiển thị công khai
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={createQuestionMutation.isPending || updateQuestionMutation.isPending}
                    className="px-6"
                  >
                    {createQuestionMutation.isPending || updateQuestionMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {isUpdate ? 'Đang cập nhật...' : 'Đang gửi...'}
                      </div>
                    ) : (
                      isUpdate ? 'Cập nhật' : 'Gửi câu hỏi'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </Form>
      )}
    </div>
  )
}
