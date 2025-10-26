import { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { AppContext } from '@/contexts/app.context'
import { ROLE } from '@/constants/role'
import MainLayout from '@/layouts/MainLayout/MainLayout'
import ManageLayout from '@/layouts/ManageLayout/ManageLayout'
import path from '@/constants/path'

interface LayoutWrapperProps {
  children: React.ReactNode
  requireAuth?: boolean
}

export default function LayoutWrapper({ children, requireAuth = true }: LayoutWrapperProps) {
  const { role, isAuthenticated } = useContext(AppContext)

  // Kiểm tra authentication nếu cần
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={path.login} />
  }

  // Quyết định layout dựa trên role
  if (role === ROLE.consultant || role === ROLE.advisor || role === ROLE.admin) {
    return <ManageLayout>{children}</ManageLayout>
  }

  // Mặc định sử dụng MainLayout cho user thường
  return <MainLayout>{children}</MainLayout>
}
