import http from '@/utils/http'
import { SuccessResponse } from '@/types/utils.type'

export const uploadFile = (formData: FormData) => 
  http.post<SuccessResponse<{ fileUrl: string }>>('upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
