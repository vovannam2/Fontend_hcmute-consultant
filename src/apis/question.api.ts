import { CommonQuestionQueryConfig } from '@/hooks/useCommonQuestionQueryConfig'
import { ForwardQuestionQueryConfig } from '@/hooks/useForwardQuestionQueryConfig'
import { QuestionQueryConfig } from '@/hooks/useQuestionQueryConfig'
import {
  Answer,
  CommonQuestion,
  CreateQuestionRequest,
  CreateQuestionResponse,
  DeletionLog,
  ForwardQuestion,
  MyAnswer,
  Question,
  QuestionStatus
} from '@/types/question.type'
import { PaginationResponse, SuccessResponse } from '@/types/utils.type'
import http from '@/utils/http'

export const getAllQuestion = (params: QuestionQueryConfig) =>
  http.get<SuccessResponse<PaginationResponse<Question[]>>>('questions', {
    params
  })

export const getAllQuestionsByDepartment = (params: QuestionQueryConfig) =>
  http.get<SuccessResponse<PaginationResponse<Question[]>>>('questions/consultant/questions/all', {
    params
  })

export const getMyQuestions = (params: QuestionQueryConfig) =>
  http.get<SuccessResponse<PaginationResponse<Question[]>>>('/questions/my', {
    params
  })
export const getQuestions = (params: QuestionQueryConfig) =>
  http.get<SuccessResponse<PaginationResponse<Question[]>>>('/question-answer/list', {
    params
  })

export const getQuestionById = (questionId: string) =>
  http.get<SuccessResponse<Question>>(`questions/${questionId}`)

export const getCommonQuestion = () =>
  http.get<SuccessResponse<PaginationResponse<CommonQuestion[]>>>('list-common-question')

export const createNewQuestion = (params: CreateQuestionRequest, file?: File) => {
  const formData = new FormData()
  
  // Add all params to formData
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value))
    }
  })
  
  // Add file if exists
  if (file) {
    formData.append('file', file)
  }
  
  return http.post<SuccessResponse<CreateQuestionResponse>>(
    'user/question/create',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  )
}

export const updateQuestion = (questionId: string, params: CreateQuestionRequest, file?: File) => {
  const formData = new FormData()
  
  // Add all params to formData
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value))
    }
  })
  
  // Add questionId to formData
  formData.append('questionId', questionId)
  
  // Add file if exists
  if (file) {
    formData.append('file', file)
  }
  
  return http.put<SuccessResponse<string>>(
    'user/question/update',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  )
}

export const getAllQuestionStatus = () => http.get<SuccessResponse<QuestionStatus[]>>('questions/list-filter-status-options')

export const deleteQuestion = (questionId: string) =>
  http.delete<SuccessResponse<string>>('question/delete', {
    params: {
      questionId
    }
  })

export const deleteUserQuestion = (id: string) =>
  http.delete<SuccessResponse<string>>('user/question/delete', {
    params: {
      id
    }
  })

export const deleteQuestionByConsultant = (questionId: string, reason: string) =>
  http.delete<SuccessResponse<string>>('question/delete', {
    params: {
      questionId,
      reason
    }
  })

export const answerTheQuestion = (params: Answer, file?: File) => {
  const formData = new FormData()
  
  // Add all params to formData
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value))
    }
  })
  
  // Add file if exists
  if (file) {
    formData.append('file', file)
  }
  
  return http.post<SuccessResponse<string>>(
    'questions/consultant/answers',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  )
}

export const getDeleteLog = (questionId: string) =>
  http.get<SuccessResponse<DeletionLog>>(`questions/logs/deletion/${questionId}`)

export const forwardQuestion = (body: { toDepartmentId: string; questionId: string; consultantId: number; note?: string }) =>
  http.post<SuccessResponse<string>>(`forward/questions/${body.questionId}/forward`, {
    targetDepartmentId: body.toDepartmentId,
    reason: body.note
  })

export const getCommonQuestionAdvisor = (params: CommonQuestionQueryConfig) =>
  http.get<SuccessResponse<PaginationResponse<CommonQuestion[]>>>('advisor-admin/list-common-question', {
    params
  })

export const deleteCommonQuestionAdvisor = (id: number) =>
  http.delete<SuccessResponse<CommonQuestion[]>>('advisor-admin/common-question/delete', {
    params: {
      id
    }
  })

export const approvalAnswer = (questionId: string, content: string, file?: File) => {
  const formData = new FormData()
  formData.append('content', content)
  if (file) {
    formData.append('file', file)
  }
  
  return http.post<SuccessResponse<string>>(
    'manager/answer/review',
    formData,
    {
      params: {
        questionId
      },
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  )
}



export const updateAnswer = (params: MyAnswer, file?: File) => {
  const formData = new FormData()
  
  // Add all params to formData
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value))
    }
  })
  
  // Add file if exists
  if (file) {
    formData.append('file', file)
  }
  
  return http.put<SuccessResponse<string>>(
    'questions/answer/update',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  )
}

export const deleteAnswer = (id: number) =>
  http.delete<SuccessResponse<string>>('questions/answer/delete', {
    params: {
      id
    }
  })

export const getForwardQuestion = (params: ForwardQuestionQueryConfig) =>
  http.get<SuccessResponse<PaginationResponse<ForwardQuestion[]>>>('/forward/forward-question/list', {
    params
  })

export const updateForwardQuestion = (body: ForwardQuestion, forwardQuestionId: number) =>
  http.put<SuccessResponse<string>>('/forward/forward-question/update', body, {
    params: {
      forwardQuestionId
    }
  })

export const deleteForwardQuestion = (forwardQuestionId: number) =>
  http.delete<SuccessResponse<string>>('/forward/forward-question/delete', {
    params: {
      forwardQuestionId
    }
  })

export const checkLike = (questionId: string) =>
  http.post<SuccessResponse<string>>('like/question/check', null, {
    params: {
      questionId
    }
  })

export const getLikeCount = (questionId: string) =>
  http.get<SuccessResponse<number>>('like-count/question', {
    params: {
      questionId
    }
  })

export const likeQuestion = (questionId: string) =>
  http.post<SuccessResponse<string>>('like/question', null, {
    params: {
      questionId
    }
  })

export const unlikeQuestion = (questionId: string) =>
  http.delete<SuccessResponse<string>>('unlike/question', {
    params: {
      questionId
    }
  })

export const convertToCommonQuestion = (questionId: string) =>
  http.post<SuccessResponse<string>>('manager/common-question/convert-to-common', null, {
    params: {
      questionId
    }
  })
