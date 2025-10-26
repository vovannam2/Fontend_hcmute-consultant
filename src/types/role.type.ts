export interface RoleType {
  id: string
  name: string
  createdAt: string
}

export interface ConsultantRoleType {
  id: string
  name: string
  createdAt: string
  roleId: string
}
