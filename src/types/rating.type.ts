import { QueryConfig } from './utils.type'

export interface Rating {
  id: string
  consultant: {
    id: string
    name: string
  }
  department: {
    id: string
    name: string
  }
  user: {
    id: string
    name: string
  }
  generalSatisfaction: ''
  generalComment: ''
  expertiseKnowledge: ''
  expertiseComment: ''
  attitude: ''
  attitudeComment: ''
  responseSpeed: ''
  responseSpeedComment: ''
  understanding: ''
  understandingComment: ''
}

export interface RatingType {
  id: string
  fullName: string
  studentCode: string
  email: string
  department: string
  role: string
  ratingCount: number
  generalSatisfaction: number
  expertiseKnowledge: number
  attitude: number
  responseSpeed: number
  understanding: number
}

export type RatingQueryConfig = {
  fromDate?: string
  toDate?: string
} & QueryConfig
