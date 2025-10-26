export interface Consultant {
  id: number
  fullName: string
  email?: string
  phone: string
  isOnline?: boolean
  department: {
    id: number
    name: string
  }
  avatarUrl: string
}

export interface SchedualConsultant {
  id: number
  department: {
    id: number
    name: string
  }
  user?: {
    id: number
    username: string
    fullName: string
    email: string
    avatarUrl: string
  }
  consultant?: {
    id: number
    username: string
    fullName: string
    email: string
    avatarUrl: string
  }
  userName: string
  consultantName: string
  title: string
  content: string
  mode: boolean
  statusPublic: boolean
  consultationDate: string
  consultationTime: string
  location: string
  link: string
  type: boolean
  participantCount?: number
  avatarUrl?: string
}

export interface SchedualConfirm {
  title: string
  content: string
  consultationDate: string
  consultationTime: string
  location?: string
  link?: string
  mode: boolean
  statusPublic: boolean
}

export interface ConsultantStatistic {
  totalQuestions: 8
  totalForwardedQuestions: 0
  totalDeletedQuestions: 1
  totalAnswersGiven: 5
  totalAnswerApproval: 0
  totalConfirmedConsultantSchedule: 0
  totalApprovedPosts: 0
  totalConversations: 2
  totalRatings: 2
  totalUniqueUsersAdvisedByMessages: 0
}

export interface ConsultationType {
  id: number
  user: {
    id: number
    name: string
  }
  consultationSchedule: {
    id: number
    title: string
  }
  registeredAt: string
  status: boolean
}
