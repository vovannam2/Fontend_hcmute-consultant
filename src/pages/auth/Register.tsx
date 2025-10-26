import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import path from '@/constants/path'
import registerStatus from '@/constants/registerStatus'
import { RegisterSchema } from '@/utils/rules'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import { Link, useSearchParams } from 'react-router-dom'
import * as yup from 'yup'
import BackgroundImage from '@/assets/images/backgrounds/background_login.jpg'
import { useMutation } from '@tanstack/react-query'
import { registerRequest, registerVerify } from '@/apis/auth.api'
import { isAxiosUnprocessableEntity } from '@/utils/utils'
import { ErrorResponse } from '@/types/utils.type'
import { useState } from 'react'

type FormData = yup.InferType<typeof RegisterSchema>
type OTPFormData = { code: string }

export default function Register() {
  const [searchParams, setSearchParams] = useSearchParams()
  const status = searchParams.get('status') || registerStatus.create

  const [registerData, setRegisterData] = useState<FormData | null>(null)
  const [email, setEmail] = useState('')

  const form = useForm<FormData>({
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      gender: 'NAM'
    },
    resolver: yupResolver(RegisterSchema)
  })

  const otpForm = useForm<OTPFormData>({
    defaultValues: {
      code: ''
    },
    resolver: yupResolver(yup.object({ code: yup.string().required('Bạn phải nhập mã OTP').length(6, 'Mã OTP phải có 6 ký tự') }))
  })

  const registerRequestMutation = useMutation({
    mutationFn: (body: FormData & { fullName: string; department?: string }) => {
      const { username, email, password, phone } = body
      return registerRequest({
        fullName: username,
        email,
        password,
        role: 'USER', // Mặc định USER
        studentCode: username, // Using username as studentCode
        phone
      })
    }
  })

  const registerVerifyMutation = useMutation({
    mutationFn: (body: { email: string; code: string }) => registerVerify(body)
  })

  const onSubmit = form.handleSubmit((values) => {
    setRegisterData(values)
    setEmail(values.email)
    registerRequestMutation.mutate(
      { ...values, fullName: values.username },
      {
        onSuccess: () => {
          setSearchParams({ status: registerStatus.confirm })
        },
        onError: (error) => {
          if (isAxiosUnprocessableEntity<ErrorResponse<{ field: string; message: string }[]>>(error)) {
            const formError = error.response?.data.data
            formError?.forEach(({ field, message }) => {
              form.setError(field as keyof FormData, {
                message: message,
                type: 'server'
              })
            })
          } else {
            const serverMessage = (error as any)?.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.'
            form.setError('email', {
              message: serverMessage,
              type: 'server'
            })
          }
        }
      }
    )
  })

  const onVerifyOTP = otpForm.handleSubmit((values) => {
    registerVerifyMutation.mutate(
      { email, code: values.code },
      {
        onSuccess: () => {
          setSearchParams({ status: registerStatus.success })
        },
        onError: (error) => {
          const serverMessage = (error as any)?.response?.data?.message || 'Mã OTP không đúng. Vui lòng thử lại.'
          otpForm.setError('code', {
            message: serverMessage,
            type: 'server'
          })
        }
      }
    )
  })

  if (status === registerStatus.success) {
    return (
      <div className='relative h-screen bg-cover bg-center' style={{ backgroundImage: `url(${BackgroundImage})` }}>
        <div className='absolute inset-0 bg-black opacity-50'></div>
        <div className='relative z-10 flex items-center justify-center h-full'>
          <div className='w-full max-w-md bg-white bg-opacity-5 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg p-8 text-center'>
            <h1 className='font-bold text-3xl mb-4 text-white'>Đăng ký thành công!</h1>
            <p className='text-white mb-6'>Tài khoản của bạn đã được tạo thành công. Vui lòng đăng nhập để tiếp tục.</p>
            <Link to={path.login}>
              <Button className='px-8 bg-primary rounded-full hover:bg-primary/90 transition-all'>
                Đăng nhập ngay
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (status === registerStatus.confirm) {
    return (
      <div className='relative h-screen bg-cover bg-center' style={{ backgroundImage: `url(${BackgroundImage})` }}>
        <div className='absolute inset-0 bg-black opacity-50'></div>
        <div className='relative z-10 flex items-center justify-center h-full'>
          <div className='w-full max-w-md bg-white bg-opacity-5 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg p-8'>
            <h1 className='font-bold text-3xl text-center mb-6 text-white'>Xác nhận OTP</h1>
            <p className='text-white text-center mb-6'>
              Chúng tôi đã gửi mã OTP đến <span className='font-bold'>{email}</span>
            </p>
            <Form {...otpForm}>
              <form onSubmit={onVerifyOTP} className='space-y-4'>
                <FormField
                  control={otpForm.control}
                  name='code'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-white'>Mã OTP</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder='Nhập 6 số OTP'
                          maxLength={6}
                          className='bg-white/10 border-white/20 text-white placeholder:text-white/60'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  disabled={registerVerifyMutation.isPending}
                  type='submit'
                  className='w-full py-3 bg-primary rounded-full hover:bg-primary/90 transition-all'
                >
                  {registerVerifyMutation.isPending ? 'Đang xác nhận...' : 'Xác nhận OTP'}
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => {
                    setSearchParams({ status: registerStatus.create })
                    registerRequestMutation.mutate(
                      { ...registerData!, fullName: registerData!.username },
                      {
                        onSuccess: () => {
                          setSearchParams({ status: registerStatus.confirm })
                        },
                        onError: (error) => {
                          const serverMessage = (error as any)?.response?.data?.message || 'Gửi lại OTP thất bại.'
                          otpForm.setError('code', {
                            message: serverMessage,
                            type: 'server'
                          })
                        }
                      }
                    )
                  }}
                  className='w-full bg-white/10 border-white/20 text-white hover:bg-white/20'
                >
                  Gửi lại OTP
                </Button>
                <Link
                  to={path.login}
                  className='block text-center text-sm text-white hover:text-white/80'
                >
                  Quay lại đăng nhập
                </Link>
              </form>
            </Form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='relative h-screen bg-cover bg-center' style={{ backgroundImage: `url(${BackgroundImage})` }}>
      <div className='absolute inset-0 bg-black opacity-50'></div>
      <div className='relative z-10 flex items-center justify-center h-full'>
        <div className='w-full max-w-md bg-white bg-opacity-5 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg p-8'>
          <h1 className='font-bold text-3xl text-center mb-6 text-white'>Đăng ký</h1>
          <Form {...form}>
            <form onSubmit={onSubmit} className='space-y-4'>
              <FormField
                control={form.control}
                name='username'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-white'>Họ và tên</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder='Nhập họ và tên'
                        className='bg-white/10 border-white/20 text-white placeholder:text-white/60'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-white'>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type='email'
                        placeholder='Email'
                        className='bg-white/10 border-white/20 text-white placeholder:text-white/60'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-white'>Mật khẩu</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type='password'
                        placeholder='Mật khẩu'
                        className='bg-white/10 border-white/20 text-white placeholder:text-white/60'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='confirmPassword'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-white'>Xác nhận mật khẩu</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type='password'
                        placeholder='Nhập lại mật khẩu'
                        className='bg-white/10 border-white/20 text-white placeholder:text-white/60'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='phone'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-white'>Số điện thoại</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder='Số điện thoại'
                        className='bg-white/10 border-white/20 text-white placeholder:text-white/60'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                disabled={registerRequestMutation.isPending}
                type='submit'
                className='w-full py-3 bg-primary rounded-full hover:bg-primary/90 transition-all'
              >
                {registerRequestMutation.isPending ? 'Đang đăng ký...' : 'Đăng ký'}
              </Button>
              <div className='mt-6 text-center text-sm text-white'>
                Đã có tài khoản?{' '}
                <Link to={path.login} className='font-bold text-foreground hover:text-foreground/80'>
                  Đăng nhập
                </Link>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}

