import api from './api'

// Đăng ký - bước 1: gửi OTP
export const registerRequest = (payload) => api.post('/api/auth/register/request', payload)

// Đăng ký - bước 2: xác thực OTP
export const registerVerify = (payload) => api.post('/api/auth/register/verify', payload)

export const login = (payload) => api.post('/api/auth/login', payload)

export const forgotPassword = (payload) => api.post('/api/auth/forgot-password', payload)
export const resetPassword = (payload) => api.post('/api/auth/reset-password', payload)

export const getProfile = () => api.get('/api/users/me')
export const updateProfile = (payload) => api.put('/api/users/me', payload)
