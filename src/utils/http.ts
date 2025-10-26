import { URL_LOGIN, URL_REFRESH_TOKEN } from '@/apis/auth.api'
import { toast } from 'sonner'
import { AuthResponse } from '@/types/auth.type'
import { SuccessResponse } from '@/types/utils.type'
import {
  clearLS,
  getAccessTokenFromLocalStorage,
  getRefreshTokenFromLocalStorage,
  setAccessTokenToLocalStorage,
  setRefreshTokenToLocalStorage,
  setRoleToLocalStorage
} from '@/utils/auth'
import { parseJWT } from '@/utils/utils'
import axios, { AxiosError, AxiosInstance, HttpStatusCode, InternalAxiosRequestConfig } from 'axios'

const API_URL = import.meta.env.VITE_API_URL

class HTTP {
  instance: AxiosInstance
  access_token: string
  refresh_token: string
  refreshTokenRequest: Promise<string> | null

  constructor() {
    this.instance = axios.create({
      baseURL: API_URL,
      timeout: 100000
    })

    this.access_token = getAccessTokenFromLocalStorage()
    this.refresh_token = getRefreshTokenFromLocalStorage()
    this.refreshTokenRequest = null

    this.instance.interceptors.request.use(
      (config) => {
        if (!this.access_token) {
          this.access_token = getAccessTokenFromLocalStorage()
        }
        if (this.access_token && config.headers) {
          config.headers.Authorization = 'Bearer ' + this.access_token
        }
        return config
      },
      (error: AxiosError) => {
        return Promise.reject(error)
      }
    )

    this.instance.interceptors.response.use(
      (response) => {
        const { url } = response.config
        if (url === URL_LOGIN) {
          this.access_token = (response.data as SuccessResponse<AuthResponse>).data.accessToken
          this.refresh_token = (response.data as SuccessResponse<AuthResponse>).data.refreshToken
          setAccessTokenToLocalStorage((response.data as SuccessResponse<AuthResponse>).data.accessToken)
          setRefreshTokenToLocalStorage((response.data as SuccessResponse<AuthResponse>).data.refreshToken)
          const payload = parseJWT((response.data as SuccessResponse<AuthResponse>).data.accessToken)
          setRoleToLocalStorage(payload.authorities[0])
        }
        return response
      },
      (error: AxiosError) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data: any | undefined = error.response?.data
        if (
          ![HttpStatusCode.Unauthorized, HttpStatusCode.UnprocessableEntity].includes(
            error.response?.status as HttpStatusCode
          ) &&
          !data?.type
        ) {
          const message = data?.message || error.message
          toast.error(message)
        }
        /// check xem respone error có phải 401 ko
        if (error.response?.status === HttpStatusCode.Unauthorized) {
          const data = error.response?.data
          
          const config = error.response?.config || ({ headers: {} } as InternalAxiosRequestConfig)
          const { url } = config
          
          // Chỉ refresh token khi:
          // 1. Có refresh token
          // 2. Không phải request refresh token  
          // 3. Backend trả về type = 'EXPIRE_TOKEN'
          if (this.refresh_token && url !== URL_REFRESH_TOKEN && data?.type === 'EXPIRE_TOKEN') {
            this.refreshTokenRequest = this.refreshTokenRequest
              ? this.refreshTokenRequest
              : this.handleRefreshToken().finally(() => {
                  this.refreshTokenRequest = null
                })
            return this.refreshTokenRequest?.then((accessToken) => {
              return this.instance({
                ...config,
                headers: { ...config.headers, authorization: 'Bearer ' + accessToken }
              })
            })
          } else if (data?.type === 'INVALID_TOKEN') {
            // Token không hợp lệ
            clearLS()
            this.access_token = ''
            this.refresh_token = ''
            // Redirect to login page
            window.location.href = '/login'
          } else {
            // Không có refresh token hoặc lỗi không xác định
            clearLS()
            this.access_token = ''
            this.refresh_token = ''
            // Redirect to login page
            window.location.href = '/login'
          }
        }
        return Promise.reject(error)
      }
    )
  }

  private handleRefreshToken() {
    return this.instance
      .post<SuccessResponse<AuthResponse>>(URL_REFRESH_TOKEN, {
        refreshToken: this.refresh_token
      })
      .then((res) => {
        const { accessToken, refreshToken } = res.data.data
        setAccessTokenToLocalStorage(accessToken)
        setRefreshTokenToLocalStorage(refreshToken)
        this.access_token = accessToken
        this.refresh_token = refreshToken
        return accessToken
      })
      .catch((error) => {
        clearLS()
        this.access_token = ''
        this.refresh_token = ''
        throw error
      })
  }
}

const http = new HTTP().instance
export default http
