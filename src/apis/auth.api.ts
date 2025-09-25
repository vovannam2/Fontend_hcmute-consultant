//import { RegisterFormData } from '@/pages/Auth/Register/components/RegisterForm'
import { RegisterFormData } from '@/pages/Auth/Register/components/RegisterForm'
import { AuthResponse } from '@/types/auth.type'
import { SuccessResponse } from '@/types/utils.type'
import http from '@/utils/http'

export const URL_LOGIN = 'auth/login'
export const URL_REGISTER = 'auth/register'
export const URL_REFRESH_TOKEN = 'auth/refresh'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export const register = (body: RegisterFormData) => {
  if (USE_MOCK) {
    const mockResponse: SuccessResponse<AuthResponse> = {
      status: 'OK',
      message: 'Mock register success',
      data: {
        accessToken: 'mock_access_token',
        refreshToken: 'mock_refresh_token',
        expiresIn: 3600,
        user: {
          id: 1,
          studentCode: 'N/A',
          username: body.username,
          schoolName: 'HCMUTE',
          firstName: 'User',
          lastName: 'Mock',
          phone: body.phone,
          avatarUrl: '',
          gender: body.gender,
          email: body.email,
          name: body.username,
          address: {
            line: '',
            provinceCode: '',
            districtCode: '',
            wardCode: ''
          }
        }
      }
    }
    // Return a shape compatible with axios.post
    return Promise.resolve({ data: mockResponse } as unknown as { data: SuccessResponse<AuthResponse> })
  }
  return http.post<SuccessResponse<AuthResponse>>(URL_REGISTER, body)
}

export const confirmRegistration = (body: { emailRequest: string; token: string }) =>
  http.post<SuccessResponse<string>>('auth/confirm-registration', body)

export const login = (body: { email: string; password: string }) =>
  http.post<SuccessResponse<AuthResponse>>(URL_LOGIN, body)

export const resendRegisterVerificationCode = (body: { emailRequest: string }) =>
  http.post<SuccessResponse<string>>('auth/resend-register-verification-code', body)

export const changeEmail = (body: { oldEmail: string; newEmail: string }) =>
  http.post<SuccessResponse<string>>('auth/change-email', body)

export const sendCodeToEmailToChangePassword = (body: { emailRequest: string }) =>
  http.post<SuccessResponse<string>>('auth/forgot-password', body)

export const verifyCodeWhenForgotPassword = (body: { emailRequest: string; code: string }) =>
  http.post('auth/verify-code', body)

export const resetPassword = (body: { email: string; newPassword: string; repeatPassword: string; token: string }) =>
  http.post<SuccessResponse<string>>('auth/reset-password', body)

export const refreshToken = (body: { refreshToken: string }) =>
  http.post<SuccessResponse<AuthResponse>>(URL_REFRESH_TOKEN, body)

export const updatePassword = (body: { currentPassword: string; newPassword: string; confirmNewPassword: string }) =>
  http.put<SuccessResponse<string>>('profile/change-password', body)


