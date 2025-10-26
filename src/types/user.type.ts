export interface User {
  id: string
  studentCode: string
  username: string
  schoolName: string
  fullName: string
  phone: string
  avatarUrl: string
  gender: string
  email: string
  name: string
  address: {
    line: string
    provinceCode: string
    districtCode: string
    wardCode: string
  }
}

export interface UserDetail {
  id: string
  studentCode: string
  schoolName: string
  fullName: string
  phone: string
  avatarUrl: string
  gender: string
  name: string
  address: {
    line: string
    provinceFullName: string
    districtFullName: string
    wardFullName: string
  }
}

export interface UserUpdate {
  username: string
  studentCode: string
  schoolName: string
  fullName: string
  phone: string
  avatarUrl: string
  gender: string
  addressLine: string
  provinceCode: string
  districtCode: string
  wardCode: string
  email: string
}

export interface UserOnline {
  fullName: string
  email: string
  phone: string
  status: string
  avatarUrl: string
}

// export type Role = 'TUVANVIEN' | 'TRUONGBANTUVAN' | 'ADMIN'

export interface AdminUser {
  id: string
  createdAt: string
  isActivity: boolean
  username: string
  email: string
  department: {
    id: string
    name: string
  }
  role: {
    id: string
    name: string
  }
  roleConsultant: string
  lastActivity: string
  isOnline: boolean
}
