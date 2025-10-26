import { ConsultantQueryConfig } from '@/hooks/useConsultantQueryConfig'

import { Consultant, SchedualConfirm, SchedualConsultant } from '@/types/consultant.type'
import { MemberJoin } from '@/pages/Manage/SchedualDetail/components/DialogListMemberJoin'
import { CreateScheduleFormData } from '@/pages/Manage/ManageSchedual/components/DialogCreateSchedule'
import { Rating, RatingQueryConfig } from '@/types/rating.type'
import { PaginationResponse, SuccessResponse } from '@/types/utils.type'
import http from '@/utils/http'

export const getAllConsultant = (params: ConsultantQueryConfig) =>
  http.get<SuccessResponse<PaginationResponse<Consultant[]>>>('user/list-consultant', {
    params
  })

export const getConsultantsByDepartment = (departmentId: string) =>
  http.get<SuccessResponse<Consultant[]>>('user/consultants-by-department', {
    params: {
      departmentId
    }
  })

export const getConsultantById = (id: string) =>
  http.get<SuccessResponse<Consultant>>(`user/list-consultant/${id}`)

export const getAllRating = (params: RatingQueryConfig) =>
  http.get<SuccessResponse<PaginationResponse<Rating[]>>>('rating/list', {
    params
  })

export const getRatingById = (id: string) =>
  http.get<SuccessResponse<Rating>>('rating/detail', {
    params: {
      id
    }
  })

export const getPastRating = (consultantId: string) =>
  http.get<SuccessResponse<Rating>>('list-consultant-rating-by-department', {
    params: {
      consultantId
    }
  })

export const getTeacherConsultantsByDepartment = (departmentId: number) =>
  http.get<SuccessResponse<Consultant[]>>('list-consultant-teacher-by-department', {
    params: {
      departmentId
    }
  })

export const getSchedualById = (scheduleId: string) =>
  http.get<SuccessResponse<SchedualConsultant>>(`consultation-schedule/detail/${scheduleId}`)

export const confirmSchedual = (scheduleId: string, body: SchedualConfirm) =>
  http.post<SuccessResponse<string>>(`consultant/consultation-schedule/confirm/${scheduleId}`, body)

export const getScheduleDetail = (scheduleId: string) =>
  http.get<SuccessResponse<SchedualConsultant>>(`consultation-schedule/detail/${scheduleId}`)

export const joinSchedule = (scheduleId: string) =>
  http.post<SuccessResponse<string>>('user/consultation-schedule/join', null, {
    params: {
      scheduleId
    }
  })

export const checkJoinConsultation = (scheduleId: string) =>
  http.get<SuccessResponse<boolean>>('user/consultation-schedule/check', {
    params: {
      scheduleId
    }
  })

export const cancelConsultation = (scheduleId: string) =>
  http.post<SuccessResponse<string>>('user/consultation-schedule/cancel', null, {
    params: {
      scheduleId
    }
  })

export const deleteSchedual = (scheduleId: string) =>
  http.delete<SuccessResponse<string>>(`consultation-schedule/delete/${scheduleId}`)

export const listMemberJoin = (consultationScheduleId: string) =>
  http.get<SuccessResponse<PaginationResponse<MemberJoin[]>>>(`advisor-admin/consultation-schedule/list-member-join?consultationScheduleId=${consultationScheduleId}`)
export const createSchedule = (body: CreateScheduleFormData) =>
  http.post<SuccessResponse<string>>('advisor-admin/consultation-schedule/create', body)

// Get online consultants
export const getOnlineConsultants = () =>
  http.get<SuccessResponse<any[]>>('user/online-consultants')
