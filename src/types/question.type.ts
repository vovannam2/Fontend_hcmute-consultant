import { Department } from '@/types/department.type'
import { Field } from '@/types/field.type'
import { RoleAsk } from '@/types/roleAsk.type'

export interface ForwardQuestion {
  id: string
  title: string
  fromDepartment: Department
  toDepartment: Department
  consultant: {
    id: string
    name: string
  }
  statusForward: boolean
  createdBy: string
  createdAt: string
  questionId: string
}

export interface AnswerItem {
  id: number
  content: string
  title: string
  file?: string
  createdAt: string
  statusApproval: boolean
  user: {
    id: string
    username: string
    fullName?: string
    avatarUrl?: string
  }
}

export interface Question {
  id: string
  department: Department
  originalDepartment?: Department // Khoa gốc nếu đã được forward
  field: Field
  roleAsk: RoleAsk
  title: string
  content: string
  createdAt: string
  views: number
  fileUrl: string
  user: {
    id: string
    username: string
    studentCode?: string
    fullName?: string
  }
  askerFullName: string
  askerAvatarUrl: string
  answerTitle: string
  answerId: number
  answerContent: string
  answerUserFullName: string
  answerCreatedAt: string
  answerAvatarUrl: string
  answerFileUrl: string
  questionFilterStatus: string
  filterStatus: string[]
  forwardQuestionDTO: ForwardQuestion
  askerId: number
  answers?: AnswerItem[]
}

export interface CommonQuestion {
  commonQuestionId: number
  department: Department
  answerContent: string
  answerTitle: string
  content: string
  createdAt: string
  createdBy: { id: string; name: string }
  file: string
  fileAnswer: string
  status: boolean
  title: string
}

export interface CreateQuestionRequest {
  departmentId: string
  fieldId: string
  roleAsk: string
  title: string
  content: string
  fullName: string
  studentCode: string
  statusPublic: boolean
}

export interface CreateQuestionResponse {
  departmendId: number
  fieldId: number
  roleAskId: number
  title: string
  content: string
  fullName: string
  studentCode?: string
  statusPublic: boolean
  fileName: string
  views: number
  statusApproval: boolean
  createdAt: string
  updatedAt: string
}

export type StatusKey = 'ANSWERED' | 'NOT_ANSWERED' | 'PRIVATE' | 'PUBLIC' | 'DELETED' | 'APPROVED'

export interface QuestionStatus {
  key: StatusKey
  displayName: string
}

export interface Answer {
  questionId: number
  title: string
  content: string
  statusApproval: boolean
  roleConsultant?: 'USER' | 'TUVANVIEN' | 'TRUONGBANTUVAN' | 'GIANGVIEN' | 'SINHVIEN'
}

export interface MyAnswer {
  answerId: number
  title: string
  content: string
  statusApproval: boolean
}

export interface DeletionLog {
  deletedAt: string
  deletedBy: string
  questionId: number
  questionTitle: string
  reason: string
}
