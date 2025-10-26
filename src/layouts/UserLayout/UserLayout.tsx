import { NavLink, Outlet } from 'react-router-dom'
import clsx from 'clsx'
import { CalendarIcon, DashboardIcon, RulerHorizontalIcon } from '@radix-ui/react-icons'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'

import path from '@/constants/path'
import { PencilSquare, QuestionCircle, UserIcon } from '@/icons'
import { useContext } from 'react'
import { AppContext } from '@/contexts/app.context'
import { ROLE } from '@/constants/role'
import { useQuery } from '@tanstack/react-query'
import { getProfile } from '@/apis/user.api'

// Simple UserLayoutHeader component using only UI components
function UserLayoutHeader() {
  const { user } = useContext(AppContext)
  
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile
  })

  return (
    <Card className="mb-8 shadow-sm">
      <CardContent className="p-6">
        <div className='flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-4'>
          <Avatar className="h-16 w-16 border-2 border-primary/20">
            <AvatarImage src={profile?.data.data.avatarUrl || user?.avatarUrl} />
            <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-primary/10 to-primary/20">
              {user?.fullName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className='text-center lg:text-left'>
            <h2 className="font-semibold text-lg text-foreground">{user?.fullName || user?.username}</h2>
            <p className='text-muted-foreground text-sm'>Tài khoản cá nhân</p>
            <div className="flex items-center justify-center lg:justify-start gap-2 mt-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-green-600 font-medium">Đang hoạt động</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function UserLayout() {
  const { role } = useContext(AppContext)

  const userNavData = [
    {
      id: 1,
      path: path.profile,
      icon: <UserIcon className='size-5' />,
      label: 'Hồ sơ của tôi',
      hidden: false
    },
    {
      id: 2,
      path: path.changePassword,
      icon: <PencilSquare className='size-5' />,
      label: 'Thay đổi mật khẩu',
      hidden: false
    },
    {
      id: 3,
      path: path.myQuestions,
      icon: <QuestionCircle className='size-5' />,
      label: 'Câu hỏi của tôi',
      hidden: role !== ROLE.user
    },
    {
      id: 4,
      path: path.mySchedual,
      icon: <CalendarIcon className='size-5' />,
      label: 'Lịch tư vấn của tôi',
      hidden: role !== ROLE.user
    },
    {
      id: 5,
      path: path.consultation,
      icon: <CalendarIcon className='size-5' />,
      label: 'Buổi tư vấn',
      hidden: role !== ROLE.user
    },
    {
      id: 6,
      path: path.myRating,
      icon: <RulerHorizontalIcon className='size-5' />,
      label: 'Đánh giá của tôi',
      hidden: role !== ROLE.user
    },
    {
      id: 7,
      path: role === ROLE.user ? path.userDashBoard : path.consultantDashboard,
      icon: <DashboardIcon className='size-5' />,
      label: 'Thống kê',
      hidden: false
    }
  ]

  const newUserNavData = userNavData.filter((item) => item.hidden === false)

  return (
    <div className='bg-gradient-to-br from-primary-bg to-primary-bg/50 text-foreground min-h-remain-screen'>
      <div className='max-w-7xl mx-auto px-4 mt-12'>
        <UserLayoutHeader />
        <div className='grid grid-cols-12 gap-6'>
          <div className='hidden lg:block col-span-3'>
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <h3 className="font-semibold text-sm text-muted-foreground mb-4 uppercase tracking-wide">Menu</h3>
                <ul className="space-y-1">
                  {newUserNavData.map((item) => (
                    <li key={item.id}>
                      <NavLink
                        to={item.path}
                        className={({ isActive }) =>
                          clsx('font-medium w-full px-3 py-3 text-sm flex items-center rounded-lg transition-all duration-200', {
                            'bg-primary text-primary-foreground shadow-sm': isActive,
                            'hover:bg-primary/10 hover:text-primary': !isActive
                          })
                        }
                      >
                        {item.icon}
                        <span className='ml-3'>{item.label}</span>
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
          <div className='col-span-12 lg:col-span-9'>
            <Card className="shadow-lg border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5">
              <CardContent className="p-6">
                <Outlet />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
