import { User, UserDetail, UserUpdate } from '@/types/user.type'
import {  SuccessResponse } from '@/types/utils.type'
import http from '@/utils/http'
import { SchedualQueryConfig } from '@/hooks/useSchedualQueryConfig'
import { PaginationResponse } from '@/types/utils.type'
import { SchedualConsultant } from '@/types/consultant.type'

export const getProfile = () => http.get<SuccessResponse<User>>('user/profile')

export const updateProfile = (params: UserUpdate, file?: File) =>
  http.put<SuccessResponse<User>>(
    'profile/update',
    {
      file
    },
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      params
    }
  )

export const getUserDetail = (id: number) =>
  http.get<SuccessResponse<UserDetail>>('admin/user-information/detail', {
    params: {
      id
    }
  })


export const banUser = (id: number) => {
  // TODO: Implement banUser API in backend
  console.warn('banUser API not implemented in backend yet')
  return Promise.resolve({
    data: {
      message: 'Chức năng cấm người dùng chưa được implement'
    }
  } as any)
}

export const getScheduals = (params: SchedualQueryConfig) =>
  http.get<SuccessResponse<PaginationResponse<SchedualConsultant[]>>>('consultation-schedule/list', {
    params
  })  
