import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import path from '@/constants/path'
import registerStatus from '@/constants/registerStatus'
import { LoginSchema } from '@/utils/rules'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import { createSearchParams, Link, useNavigate } from 'react-router-dom'
import * as yup from 'yup'
import BackgroundImage from '@/assets/images/backgrounds/background_login.jpg'
import { useMutation } from '@tanstack/react-query'
import { login } from '@/apis/auth.api'
import forgotPasswordStatus from '@/constants/forgotPasswordStatus'
import { isAxiosUnprocessableEntity, parseJWT } from '@/utils/utils'
import { ErrorResponse } from '@/types/utils.type'
import { useContext } from 'react'
import { AppContext } from '@/contexts/app.context'
import { setUserToLocalStorage, setRoleToLocalStorage } from '@/utils/auth'

type FormData = yup.InferType<typeof LoginSchema>

export default function Login() {
  const navigate = useNavigate()
  const { setIsAuthenticated, setUser, setRole } = useContext(AppContext)
  const form = useForm<FormData>({
    defaultValues: {
      email: '',
      password: ''
    },
    resolver: yupResolver(LoginSchema)
  })

  const loginMutation = useMutation({
    mutationFn: (body: FormData) => login(body)
  })

  // handle login process
  const onSubmit = form.handleSubmit((values) => {
    loginMutation.mutate(values, {
      onSuccess: (res) => {
        setIsAuthenticated(true)
        setUser(res.data.data.user)
        setUserToLocalStorage(res.data.data.user)
        const payload = parseJWT(res.data.data.accessToken)
        setRole(payload.authorities[0])
        setRoleToLocalStorage(payload.authorities[0])
        localStorage.setItem('accessToken', res.data.data.accessToken)
        navigate(path.home)
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
          const serverMessage = (error as any)?.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.'
          // Hiển thị lỗi tổng quát dưới ô Email để người dùng thấy ngay
          form.setError('email', {
            message: serverMessage,
            type: 'server'
          })
        }
      }
    })
  })

  return (
    <div className='relative h-screen bg-cover bg-center' style={{ backgroundImage: `url(${BackgroundImage})` }}>
      <div className='absolute inset-0 bg-black opacity-50'></div>
      <div className='relative z-10 flex items-center justify-center h-full'>
        <div className='w-full max-w-md bg-white bg-opacity-5 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg p-8'>
          <h1 className='font-bold text-3xl text-center mb-6'>Đăng nhập</h1>
          <Form {...form}>
            <form onSubmit={onSubmit} className='space-y-4'>
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-white'>Email</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
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
              <Link
                to={{
                  pathname: path.forgotPassword,
                  search: createSearchParams({
                    status: forgotPasswordStatus.send
                  }).toString()
                }}
                className='block text-right text-sm font-bold mb-4 text-white hover:text-white/80'
              >
                Quên mật khẩu?
              </Link>
              <Button
                disabled={loginMutation.isPending}
                type='submit'
                className='w-full py-3 bg-primary rounded-full hover:bg-primary/90 transition-all'
              >
                {loginMutation.isPending ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </Button>
              <div className='mt-6 text-center text-sm text-white'>
                Bạn chưa có tài khoản?{' '}
                <Link
                  to={{
                    pathname: path.register,
                    search: createSearchParams({
                      status: registerStatus.create
                    }).toString()
                  }}
                  className='font-bold text-foreground hover:text-foreground/80'
                >
                  Đăng ký
                </Link>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}
