import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useMutation } from '@tanstack/react-query'
import { EyeIcon, EyeSlashIcon } from '@/icons'
import { useState } from 'react'
import http from '@/utils/http'
import { SuccessResponse } from '@/types/utils.type'

// Define the form schema
const ChangePasswordSchema = yup.object({
  currentPassword: yup
    .string()
    .required('Vui lòng nhập mật khẩu hiện tại')
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  newPassword: yup
    .string()
    .required('Vui lòng nhập mật khẩu mới')
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  confirmPassword: yup
    .string()
    .required('Vui lòng xác nhận mật khẩu')
    .oneOf([yup.ref('newPassword')], 'Mật khẩu xác nhận không khớp')
})

type FormData = yup.InferType<typeof ChangePasswordSchema>

// API call
const changePassword = (data: { currentPassword: string; newPassword: string }) =>
  http.post<SuccessResponse<string>>('user/change-password', data)

export default function ChangePassword() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useForm<FormData>({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    },
    resolver: yupResolver(ChangePasswordSchema)
  })

  const changePasswordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) => changePassword(data),
    onSuccess: () => {
      toast.success('Đổi mật khẩu thành công')
      form.reset()
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra')
    }
  })

  const onSubmit = form.handleSubmit((values) => {
    changePasswordMutation.mutate({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword
    })
  })

  return (
    <div className='max-w-2xl mx-auto'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={1.5}
            stroke='currentColor'
            className='h-6 w-6'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M13.5 10.5V6.75a4.5 4.5 0 1 1 9 0v3.75M3.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z'
            />
          </svg>
          Thay đổi mật khẩu
        </CardTitle>
        <CardDescription>
          Để bảo vệ tài khoản của bạn, hãy chọn mật khẩu mạnh và không chia sẻ với người khác
        </CardDescription>
      </CardHeader>
      <Card>
        <CardContent>
          <Form {...form}>
            <form onSubmit={onSubmit} className='space-y-6'>
            {/* Current Password */}
            <FormField
              control={form.control}
              name='currentPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu hiện tại</FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <Input
                        type={showCurrentPassword ? 'text' : 'password'}
                        placeholder='Nhập mật khẩu hiện tại'
                        autoComplete='current-password'
                        {...field}
                        className='pr-10'
                      />
                      <button
                        type='button'
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        aria-label='Hiện/ẩn mật khẩu'
                        aria-pressed={showCurrentPassword}
                        className='absolute right-0 top-1/2 -translate-y-1/2 mr-3'
                      >
                        {showCurrentPassword ? <EyeSlashIcon className='h-4 w-4 text-gray-500' /> : <EyeIcon className='h-4 w-4 text-gray-500' />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* New Password */}
            <FormField
              control={form.control}
              name='newPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu mới</FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <Input
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder='Nhập mật khẩu mới'
                        autoComplete='new-password'
                        {...field}
                        className='pr-10'
                      />
                      <button
                        type='button'
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        aria-label='Hiện/ẩn mật khẩu'
                        aria-pressed={showNewPassword}
                        className='absolute right-0 top-1/2 -translate-y-1/2 mr-3'
                      >
                        {showNewPassword ? <EyeSlashIcon className='h-4 w-4 text-gray-500' /> : <EyeIcon className='h-4 w-4 text-gray-500' />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirm Password */}
            <FormField
              control={form.control}
              name='confirmPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Xác nhận mật khẩu mới</FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder='Nhập lại mật khẩu mới'
                        autoComplete='new-password'
                        {...field}
                        className='pr-10'
                      />
                      <button
                        type='button'
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label='Hiện/ẩn mật khẩu'
                        aria-pressed={showConfirmPassword}
                        className='absolute right-0 top-1/2 -translate-y-1/2 mr-3'
                      >
                        {showConfirmPassword ? <EyeSlashIcon className='h-4 w-4 text-gray-500' /> : <EyeIcon className='h-4 w-4 text-gray-500' />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type='submit'
              disabled={changePasswordMutation.isPending}
              className='w-full'
            >
              {changePasswordMutation.isPending ? 'Đang xử lý...' : 'Đổi mật khẩu'}
            </Button>
          </form>
        </Form>
        </CardContent>
      </Card>
    </div>
  )
}

