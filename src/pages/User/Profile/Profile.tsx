import { useContext, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { AppContext } from '@/contexts/app.context'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProfile, updateProfile } from '@/apis/user.api'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { toast } from 'sonner'
import { Loader2, Pencil, Save, X, Upload } from 'lucide-react'


const UpdateProfileSchema = yup.object({
  fullName: yup.string().required('Bạn phải nhập họ và tên'),
  email: yup.string().email('Email không đúng định dạng').required('Bạn phải nhập email'),
  phone: yup.string().required('Bạn phải nhập số điện thoại'),
  addressLine: yup.string().notRequired(),
  provinceCode: yup.string().notRequired(),
  districtCode: yup.string().notRequired(),
  wardCode: yup.string().notRequired()
})

type FormData = yup.InferType<typeof UpdateProfileSchema>

export default function Profile() {
  const { user, setUser } = useContext(AppContext)
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile
  })

  const profile = profileData?.data.data || user

  const form = useForm<FormData>({
    defaultValues: {
      fullName: profile?.fullName || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
      addressLine: profile?.address?.line || '',
      provinceCode: profile?.address?.provinceCode || '',
      districtCode: profile?.address?.districtCode || '',
      wardCode: profile?.address?.wardCode || ''
    },
    resolver: yupResolver(UpdateProfileSchema)
  })

  // Reset form when profile data changes
  useEffect(() => {
    if (profile && !isLoading) {
      form.reset({
        fullName: profile.fullName || '',
        email: profile.email || '',
        phone: profile.phone || '',
        addressLine: profile.address?.line || '',
        provinceCode: profile.address?.provinceCode || '',
        districtCode: profile.address?.districtCode || '',
        wardCode: profile.address?.wardCode || ''
      })
    }
  }, [profile, isLoading, form])

  const updateProfileMutation = useMutation({
    mutationFn: (data: FormData) => updateProfile(data as any, selectedFile || undefined),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      setUser(res.data.data)
      setIsEditing(false)
      setSelectedFile(null)
      setPreviewUrl(null)
      toast.success('Cập nhật hồ sơ thành công')
    },
    onError: () => {
      toast.error('Cập nhật hồ sơ thất bại')
    }
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = form.handleSubmit((values) => {
    updateProfileMutation.mutate(values)
  })

  const handleCancel = () => {
    setIsEditing(false)
    form.reset()
    setSelectedFile(null)
    setPreviewUrl(null)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Hồ sơ của tôi</h1>
          <p className="text-muted-foreground text-sm">Quản lý thông tin tài khoản của bạn</p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} variant="outline" className="gap-2">
            <Pencil className="h-4 w-4" />
            Chỉnh sửa
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-4">
              {/* Avatar Section */}
              <div className="flex items-center gap-4 pb-4 border-b">
                <Avatar className="h-20 w-20 border-2 border-primary/20">
                  <AvatarImage src={previewUrl || profile?.avatarUrl || user?.avatarUrl} />
                  <AvatarFallback className="text-xl bg-gradient-to-br from-primary/10 to-primary/20">
                    {profile?.fullName?.[0] || user?.fullName?.[0]}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="avatar-upload"
                    />
                    <label htmlFor="avatar-upload">
                      <Button type="button" variant="outline" className="gap-2" size="sm">
                        <Upload className="h-4 w-4" />
                        Thay đổi ảnh
                      </Button>
                    </label>
                  </div>
                )}
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Họ và tên</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!isEditing} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" disabled={!isEditing} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số điện thoại</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!isEditing} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <label className="text-sm font-medium">Mã sinh viên</label>
                  <Input value={profile?.studentCode || ''} disabled />
                </div>
              </div>

              {/* Address */}
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="addressLine"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Địa chỉ</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} placeholder="Số nhà, tên đường" disabled={!isEditing} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={handleCancel} className="gap-2">
                    <X className="h-4 w-4" />
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="gap-2"
                  >
                    {updateProfileMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Lưu thay đổi
                      </>
                    )}
                  </Button>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

