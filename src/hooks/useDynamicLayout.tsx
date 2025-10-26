import { useContext } from 'react'
import { AppContext } from '@/contexts/app.context'
import { ROLE } from '@/constants/role'
import MainLayout from '@/layouts/MainLayout/MainLayout'
import ManageLayout from '@/layouts/ManageLayout/ManageLayout'

export default function useDynamicLayout() {
  const { role } = useContext(AppContext)

  const getLayout = (children: React.ReactNode) => {
    if (role === ROLE.consultant || role === ROLE.advisor || role === ROLE.admin) {
      return <ManageLayout>{children}</ManageLayout>
    }
    return <MainLayout>{children}</MainLayout>
  }

  return { getLayout, isManageRole: [ROLE.consultant, ROLE.advisor, ROLE.admin].includes(role as any) }
}
