import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuPortal } from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { MessageCircle, User, LogOut, BarChart3, Sparkles, Menu } from 'lucide-react'
import LogoHCMUTE from '@/assets/images/logos/logo_hcmute_3.png'
import { clearLS } from '@/utils/auth'
import path from '@/constants/path'
import { ROLE, Role } from '@/constants/role'
import { AppContext } from '@/contexts/app.context'
import { QuestionCircle } from '@/icons'
import clsx from 'clsx'
import {
  CalendarDaysIcon,
  CaptionsIcon,
  ClipboardPlusIcon,
  CreativeCommonsIcon,
  FingerprintIcon,
  MapPinIcon,
  SchoolIcon,
  User2Icon,
  Star
} from 'lucide-react'
import { useContext, useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import useUnreadConversationCount from '@/hooks/useUnreadConversationCount'
import HeaderNotification from '@/components/HeaderNotification'

// Enhanced Header component with notification and message features
function Header() {
  const { setIsAuthenticated, isAuthenticated, user, role, setUser, setRole } = useContext(AppContext)
  const { unreadCount } = useUnreadConversationCount()

  // Get role display name
  const getRoleDisplayName = () => {
    if (role === (ROLE.consultant as Role)) return 'Tư Vấn Viên'
    if (role === (ROLE.advisor as Role)) return 'Trưởng Ban'
    if (role === (ROLE.admin as Role)) return 'Quản Trị Viên'
    return 'Người Dùng'
  }

  const handleLogout = () => {
    clearLS()
    setIsAuthenticated(false)
    setUser(null)
    setRole('')
  }

  return (
    <header className='w-full border-b border-teal-200/50 py-3 px-4 lg:px-12 flex items-center justify-between fixed top-0 left-0 z-30 bg-gradient-to-r from-cyan-50 via-teal-50 to-cyan-50 text-foreground h-header-height backdrop-blur-xl supports-[backdrop-filter]:bg-cyan-50/80 shadow-sm relative'>
      {/* Logo */}
      <div className='flex items-center'>
        <Link to={path.home} className='flex items-center space-x-3 group'>
          <div className='relative'>
            <div className='absolute inset-0 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity'></div>
            <div className='relative bg-gradient-to-br from-teal-600 to-cyan-600 p-2 rounded-xl group-hover:scale-105 transition-transform'>
              <Sparkles className='w-6 h-6 text-white' />
            </div>
          </div>
          <div>
            <p className='font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent text-sm'>HỆ THỐNG TƯ VẤN SINH VIÊN</p>
          </div>
        </Link>
      </div>

      {/* Center - Role Display */}
      <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'>
        <p className='text-xl font-bold text-red-600'>{getRoleDisplayName()}</p>
      </div>

      {/* Right side */}
      <div className='flex items-center space-x-2'>
        {isAuthenticated && (
          <div className='flex items-center space-x-3'>
            {/* Notifications */}
            <HeaderNotification />

            {/* Messages */}
            {[ROLE.consultant, ROLE.user, ROLE.advisor].includes(role as any) && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative rounded-xl hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 hover:text-teal-600 transition-all duration-200 group" 
                asChild
              >
                <Link to={path.messages}>
                  <MessageCircle className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center bg-gradient-to-r from-cyan-500 to-teal-600 text-white border-2 border-white shadow-lg animate-bounce">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                  )}
                </Link>
              </Button>
            )}

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-2 ring-transparent hover:ring-teal-200 transition-all duration-200 group">
                  <Avatar className="h-10 w-10 ring-2 ring-teal-100 group-hover:ring-teal-300 transition-all duration-200">
                    <AvatarImage src={user?.avatarUrl || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white font-semibold text-sm">
                      {(user?.fullName?.[0] ?? user?.username?.[0] ?? 'U')}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuPortal>
                <DropdownMenuContent
                  className="w-64 z-[2147483647] rounded-2xl p-3 shadow-2xl bg-white/95 backdrop-blur-md border border-teal-200/50"
                  align="end"
                  side="bottom"
                  sideOffset={8}
                  alignOffset={-10}
                  forceMount
                >
                  <div className="flex items-center gap-3 p-3 border-b border-teal-100">
                    <Avatar className="h-12 w-12 ring-2 ring-teal-100">
                      <AvatarImage src={user?.avatarUrl || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white font-semibold">
                        {(user?.fullName?.[0] ?? user?.username?.[0] ?? 'U')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col leading-none min-w-0">
                      <p className="font-semibold text-gray-900">{user?.fullName}</p>
                      <p className="w-[200px] truncate text-sm text-gray-500">
                        @{user?.username}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1 py-2">
                    <DropdownMenuItem asChild>
                      <Link
                        to={path.profile}
                        className="flex items-center gap-3 cursor-pointer rounded-xl px-3 py-3 text-gray-700 hover:bg-teal-50 hover:text-teal-600 transition-all duration-200 group"
                      >
                        <User className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                        <span className="font-medium">Hồ sơ cá nhân</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link
                        to={path.consultantDashboard}
                        className="flex items-center gap-3 cursor-pointer rounded-xl px-3 py-3 text-gray-700 hover:bg-cyan-50 hover:text-cyan-600 transition-all duration-200 group"
                      >
                        <BarChart3 className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                        <span className="font-medium">Thống kê</span>
                      </Link>
                    </DropdownMenuItem>
                  </div>

                  <div className="border-t border-teal-100 pt-2">
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="rounded-xl px-3 py-3 text-red-600 cursor-pointer hover:bg-red-50 hover:text-red-700 transition-all duration-200 group"
                    >
                      <LogOut className="mr-3 h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                      <span className="font-medium">Đăng xuất</span>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenuPortal>
            </DropdownMenu>
          </div>
        )}
      </div>
    </header>
  )
}

export default function ManageLayout({ children }: { children: React.ReactNode }) {
  const { role, user } = useContext(AppContext)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  
  const asideNav = [
    {
      title: 'Người dùng',
      children: [
        {
          path: path.manageUser,
          icon: <User2Icon className='size-5' />,
          label: 'Tài khoản',
          enabled: true
        }
      ],
      enabled: [ROLE.admin as Role].includes(role as Role)
    },
    {
      title: 'Câu hỏi',
      children: [
        {
          path: path.manageQuestion,
          icon: <QuestionCircle className='size-5' />,
          label: 'Câu hỏi',
          enabled: [ROLE.admin as Role, ROLE.consultant as Role, ROLE.advisor as Role].includes(role as Role)
        },
        {
          path: path.manageApprovalAnswer,
          icon: <QuestionCircle className='size-5' />,
          label: 'Phê duyệt',
          enabled: [ROLE.admin as Role, ROLE.advisor as Role].includes(role as Role)
        },
        {
          path: path.manageForwardQuestion,
          icon: <QuestionCircle className='size-5' />,
          label: 'Câu hỏi chuyển tiếp',
          enabled: [ROLE.admin as Role, ROLE.consultant as Role, ROLE.advisor as Role].includes(role as Role)
        },
        {
          path: path.manageCommonQuestion,
          icon: <CreativeCommonsIcon className='size-5' />,
          label: 'Câu hỏi chung',
          enabled: [ROLE.admin as Role, ROLE.advisor as Role].includes(role as Role)
        }
      ],
      enabled: [ROLE.admin as Role, ROLE.consultant as Role, ROLE.advisor as Role].includes(role as Role)
    },
    {
      title: 'Tư vấn',
      children: [
        {
          path: path.manageSchedule,
          icon: <CalendarDaysIcon className='size-5' />,
          label: 'Lịch tư vấn',
          enabled: true
        }
      ],
      enabled: [ROLE.admin as Role, ROLE.consultant as Role, ROLE.advisor as Role].includes(role as Role)
    },
    {
      title: 'Bài đăng',
      children: [
        {
          path: path.managePost,
          icon: <ClipboardPlusIcon className='size-5' />,
          label: 'Bài đăng',
          enabled: true
        }
      ],
      enabled: [ROLE.admin as Role, ROLE.advisor as Role, ROLE.consultant as Role].includes(role as Role)
    },
    {
      title: 'Đánh giá',
      children: [
        {
          path: path.manageRating,
          icon: <Star className='size-5' />,
          label: 'Đánh giá',
          enabled: true
        }
      ],
      enabled: [ROLE.admin as Role].includes(role as Role)
    },
    {
      title: 'Quyền',
      children: [
        {
          path: path.manageRole,
          icon: <FingerprintIcon className='size-5' />,
          label: 'Quyền người dùng',
          enabled: true
        },
        {
          path: path.manageConsultantRole,
          icon: <FingerprintIcon className='size-5' />,
          label: 'Quyền tư vấn viên',
          enabled: true
        },
        {
          path: path.manageAskRole,
          icon: <FingerprintIcon className='size-5' />,
          label: 'Quyền người hỏi',
          enabled: true
        }
      ],
      enabled: [ROLE.admin as Role].includes(role as Role)
    },
    {
      title: 'Địa chỉ',
      children: [
        {
          path: path.manageDistrict,
          icon: <MapPinIcon className='size-5' />,
          label: 'Quận/Huyện',
          enabled: true
        },
        {
          path: path.manageWard,
          icon: <MapPinIcon className='size-5' />,
          label: 'Phường/Xã',
          enabled: true
        },
        {
          path: path.manageProvince,
          icon: <MapPinIcon className='size-5' />,
          label: 'Tỉnh/Thành phố',
          enabled: true
        }
      ],
      enabled: [ROLE.admin as Role].includes(role as Role)
    },
    {
      title: 'Khác',
      children: [
        {
          path: path.manageField,
          icon: <CaptionsIcon className='size-5' />,
          label: 'Lĩnh vực',
          enabled: true
        },
        {
          path: path.manageDepartment,
          icon: <SchoolIcon className='size-5' />,
          label: 'Khoa',
          enabled: true
        }
      ],
      enabled: [ROLE.admin as Role].includes(role as Role)
    }
  ]
  return (
    <div className='min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50/30 to-teal-50'>
      <Header />
      
      {/* Sidebar Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 bottom-4 z-50 bg-gradient-to-br from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700 rounded-full shadow-lg hover:scale-110 transition-all"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className='gap-2 mt-[var(--header-height)] min-h-remain-screen relative'>
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed top-[var(--header-height)] left-0 bottom-0 w-[280px] bg-gradient-to-b from-slate-700 via-teal-800 to-cyan-900 text-white py-6 px-6 space-y-6 border-r border-teal-700/50 overflow-y-auto transition-transform duration-300 shadow-2xl z-40`}>
          {/* Logo Section */}
          <div className='flex flex-col items-center mb-8'>
            <div className='relative mb-4'>
              <div className='absolute inset-0 bg-white/20 rounded-2xl blur-xl'></div>
              <div className='relative bg-gradient-to-br from-cyan-400 to-teal-400 p-4 rounded-2xl'>
                <Sparkles className='w-8 h-8 text-white' />
              </div>
            </div>
            
          </div>

          {/* User Info */}
          <div className='bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20'>
            <div className='flex items-center space-x-3'>
              <Avatar className="h-12 w-12 ring-2 ring-cyan-400/50">
                <AvatarImage src={user?.avatarUrl} />
                <AvatarFallback className='bg-gradient-to-br from-cyan-400 to-teal-400 text-white font-semibold'>
                  {user?.fullName?.[0]}{user?.fullName?.split(' ').pop()?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className='text-sm font-semibold min-w-0 flex-1'>
                <p className='truncate text-white font-bold'>{user?.fullName}</p>
                <p className='text-xs text-cyan-200'>
                  {role === (ROLE.consultant as Role)
                    ? 'Tư vấn viên'
                    : role === (ROLE.advisor as Role)
                      ? 'Trưởng ban'
                      : 'Administrator'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className='space-y-6'>
            {asideNav
              .map((item) => {
                if (!item.enabled) return null
                const childrenElement = item.children
                  .map((child) => {
                    if (!child.enabled) return null
                    return (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        className={({ isActive }) =>
                          clsx('px-4 py-3 rounded-xl text-sm flex items-center justify-start gap-3 w-full transition-all duration-200 group', {
                            'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/50 font-semibold': isActive,
                            'text-teal-100 hover:bg-white/10 hover:text-white hover:translate-x-1': !isActive
                          })
                        }
                      >
                        <span className={clsx('transition-transform group-hover:scale-110', {
                          'text-cyan-200': !item.children.some((c: any) => c.path === path.manageSchedule)
                        })}>
                          {child.icon}
                        </span>
                        <span>{child.label}</span>
                      </NavLink>
                    )
                  })
                  .filter(Boolean)

                return (
                  <div key={item.title}>
                    <p className='font-bold text-xs uppercase tracking-wider text-teal-300 mb-3 ml-2'>{item.title}</p>
                    <div className='space-y-1'>{childrenElement}</div>
                  </div>
                )
              })
              .filter(Boolean)}
          </div>

          {/* Decorative Element */}
          <div className='mt-auto pt-6 border-t border-teal-700/50'>
            <div className='text-center text-xs text-teal-300'>
              <p>© 2024 HCMUTE</p>
              <p className='text-cyan-300 mt-1'>Consultant System</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className='px-6 py-4'>
          <div className={`${sidebarOpen ? 'ml-[280px]' : 'ml-0'} transition-all duration-300`}>
            <div className='bg-white rounded-3xl shadow-xl border border-teal-100 p-6 min-h-[calc(100vh-var(--header-height)-2rem)]'>
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
