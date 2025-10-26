import { SuccessResponse } from '@/types/utils.type'
import http from '@/utils/http'

export interface Field {
  id: string
  name: string
  department: string
  createdAt: string
  updatedAt: string
}

export const getFieldsByDepartment = (departmentId: string) => {
  return http.get<SuccessResponse<Field[]>>('list-field-by-department', {
    params: { departmentId }
  })
}
