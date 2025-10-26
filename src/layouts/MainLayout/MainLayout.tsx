import { useContext } from 'react'
import { Link, createSearchParams, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuPortal } from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { MessageCircle, Menu, User, LogOut, Settings, BarChart3, Home, HelpCircle, Settings2 } from 'lucide-react'
import LogoHCMUTE from '@/assets/images/logos/logo_hcmute_3.png'
import path from '@/constants/path'
import registerStatus from '@/constants/registerStatus'
import { AppContext } from '@/contexts/app.context'
import { ROLE } from '@/constants/role'
import { clearLS } from '@/utils/auth'
import useUnreadConversationCount from '@/hooks/useUnreadConversationCount'
import HeaderNotification from '@/components/HeaderNotification'

// Enhanced Header component with better design
function Header() {
  const { setIsAuthenticated, isAuthenticated, user, role, setUser, setRole } = useContext(AppContext)
  const { unreadCount } = useUnreadConversationCount()
  const location = useLocation()
  

  const handleLogout = () => {
    clearLS()
    setIsAuthenticated(false)
    setUser(null)
    setRole('')
  }

  // Check if current path is active
  const isActive = (pathname: string) => {
    return location.pathname === pathname
  }

  const isConsultant = isAuthenticated && role === ROLE.consultant

  return (
    <header className='w-full border-b border-gray-200/50 py-3 px-4 lg:px-12 flex items-center justify-between fixed top-0 left-0 z-[60] bg-white/95 text-foreground h-header-height backdrop-blur-md supports-[backdrop-filter]:bg-white/95 shadow-sm'>
      {/* Mobile Menu */}
      <div className='block lg:hidden'>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="hover:bg-gray-100 rounded-xl">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side='left' className="w-80 bg-white/95 backdrop-blur-md">
            <div className="space-y-6">
              {isAuthenticated && (
                <div className="flex items-center space-x-3 p-4 border-b border-gray-100">
                  <Avatar className="h-12 w-12 ring-2 ring-blue-100">
                    <AvatarImage src={user?.avatarUrl} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                      {user?.fullName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-gray-900">{user?.fullName}</p>
                    <p className="text-sm text-gray-500">@{user?.username}</p>
                  </div>
                </div>
              )}
              {!isConsultant && (
                <div className="space-y-1">
                  <Link 
                    to={path.home} 
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive(path.home) 
                        ? 'bg-blue-50 text-blue-600 font-medium' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Home className="h-5 w-5" />
                    Trang chủ
                  </Link>
                  <Link 
                    to={path.createQuestion} 
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive(path.createQuestion) 
                        ? 'bg-blue-50 text-blue-600 font-medium' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <HelpCircle className="h-5 w-5" />
                    Câu hỏi
                  </Link>
                  <Link 
                    to={path.consultants} 
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive(path.consultants) 
                        ? 'bg-blue-50 text-blue-600 font-medium' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <User className="h-5 w-5" />
                    Tư vấn viên
                  </Link>
                </div>
              )}
              {isConsultant && (
                <div className="space-y-1">
                  <Link 
                    to={path.manageQuestion} 
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive(path.manageQuestion) 
                        ? 'bg-purple-50 text-purple-600 font-medium' 
                        : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
                    }`}
                  >
                    <Settings2 className="h-5 w-5" />
                    Quản lý câu hỏi
                  </Link>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Left Section - Logo */}
      <div className='hidden lg:flex items-center flex-1'>
        <Link to={path.home} className='flex items-center space-x-4 group'>
          <div className="relative">
            <img src={LogoHCMUTE} alt='logo-hcmute' className={`w-12 h-12 transition-transform duration-200 group-hover:scale-105 ${isConsultant ? 'drop-shadow-lg' : ''}`} />
            <div className={`absolute inset-0 rounded-full blur-sm group-hover:blur-md transition-all duration-200 ${
              isConsultant 
                ? 'bg-gradient-to-br from-purple-400/30 to-indigo-500/30' 
                : 'bg-gradient-to-br from-blue-500/20 to-purple-600/20'
            }`}></div>
            {isConsultant && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
          <div className='w-[180px]'>
            <p className={`font-bold text-base tracking-wide transition-colors ${
              isConsultant 
                ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600' 
                : 'text-[#3155A6]'
            }`}>TƯ VẤN SINH VIÊN</p>
            <p className={`text-xs font-medium transition-colors ${
              isConsultant ? 'text-purple-600' : 'text-gray-500'
            }`}>HCMUTE</p>
          </div>
        </Link>
      </div>

      {/* Center Section - Navigation or Management Button */}
      <div className='hidden lg:flex items-center justify-center flex-1'>
        {!isConsultant && (
          <div className='flex items-center space-x-2'>
            <Link 
              to={path.home} 
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                isActive(path.home) 
                  ? 'bg-blue-50 text-blue-600 font-medium shadow-sm' 
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50/50'
              }`}
            >
              <Home className="h-4 w-4" />
              Trang chủ
            </Link>
            <Link 
              to={path.createQuestion} 
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                isActive(path.createQuestion) 
                  ? 'bg-blue-50 text-blue-600 font-medium shadow-sm' 
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50/50'
              }`}
            >
              <HelpCircle className="h-4 w-4" />
              Câu hỏi
            </Link>
            <Link 
              to={path.consultants} 
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                isActive(path.consultants) 
                  ? 'bg-blue-50 text-blue-600 font-medium shadow-sm' 
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50/50'
              }`}
            >
              <User className="h-4 w-4" />
              Tư vấn viên
            </Link>
          </div>
        )}
                 {isConsultant && (
           <div className="flex items-center gap-3">
             {/* Vai trò Badge - Đơn giản, gọn gàng */}
             <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg">
               <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
               <span className="text-sm font-bold text-white tracking-wide">
                 Tư vấn viên
               </span>
             </div>
             
             {/* Bảng quản lý Button */}
                           <Link
                to={path.manageQuestion}
                className={`relative flex items-center gap-2 px-5 py-2 rounded-xl font-semibold shadow-lg transition-all duration-300 group ${
                  isActive(path.manageQuestion)
                    ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 text-white scale-105'
                    : 'bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500 text-white hover:from-purple-600 hover:via-indigo-600 hover:to-purple-600 hover:scale-105'
                }`}
              >
                <Settings2 className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
                <span className="text-sm font-bold">Quản lý</span>
              </Link>
           </div>
         )}
      </div>

      {/* Right Section */}
      <div className='hidden lg:flex items-center flex-1 justify-end'>
        <div className='flex items-center space-x-2'>
        {!isAuthenticated && (
          <div className='flex items-center space-x-3'>
            <Button size='sm' variant='outline' asChild className="rounded-xl border-gray-300 hover:border-blue-400 hover:text-blue-600 transition-all duration-200">
              <Link
                to={{
                  pathname: path.register,
                  search: createSearchParams({
                    status: registerStatus.create
                  }).toString()
                }}
              >
                Đăng ký
              </Link>
            </Button>
            <Button size='sm' asChild className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200">
              <Link to={path.login}>Đăng nhập</Link>
            </Button>
          </div>
        )}

        {isAuthenticated && (
          <div className='flex items-center space-x-3'>
            {/* Notifications */}
            <HeaderNotification />

            {/* Messages */}
            {[ROLE.consultant, ROLE.user, ROLE.advisor].includes(role as any) && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 group" 
                asChild
              >
                <Link to={path.messages}>
                  <MessageCircle className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-600 text-white border-2 border-white shadow-lg animate-bounce">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                  )}
                </Link>
              </Button>
            )}
            
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-2 ring-transparent hover:ring-blue-200 transition-all duration-200 group">
                  <Avatar className="h-10 w-10 ring-2 ring-blue-100 group-hover:ring-blue-300 transition-all duration-200">
                    <AvatarImage src={user?.avatarUrl || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-sm">
                      {(user?.fullName?.[0] ?? user?.username?.[0] ?? 'U')}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuPortal>
                <DropdownMenuContent
                  className="w-64 z-[2147483647] rounded-2xl p-3 shadow-2xl bg-white/95 backdrop-blur-md border border-gray-200/50"
                  align="end"
                  side="bottom"
                  sideOffset={8}
                  alignOffset={-10}
                  forceMount
                >
                  <div className="flex items-center gap-3 p-3 border-b border-gray-100">
                    <Avatar className="h-12 w-12 ring-2 ring-blue-100">
                      <AvatarImage src={user?.avatarUrl || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
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
                        className="flex items-center gap-3 cursor-pointer rounded-xl px-3 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 group"
                      >
                        <User className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                        <span className="font-medium">Hồ sơ cá nhân</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link
                        to={path.userDashBoard}
                        className="flex items-center gap-3 cursor-pointer rounded-xl px-3 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 transition-all duration-200 group"
                      >
                        <BarChart3 className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                        <span className="font-medium">Thống kê</span>
                      </Link>
                    </DropdownMenuItem>

                    {role !== ROLE.consultant && (
                      <DropdownMenuItem asChild>
                        <Link
                          to={path.myQuestions}
                          className="flex items-center gap-3 cursor-pointer rounded-xl px-3 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-all duration-200 group"
                        >
                          <Settings className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                          <span className="font-medium">Câu hỏi của tôi</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                  </div>

                  <div className="border-t border-gray-100 pt-2">
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
      </div>
      
      {/* Mobile Right Section */}
      <div className='flex lg:hidden items-center space-x-2'>
        {!isAuthenticated && (
          <div className='flex items-center space-x-3'>
            <Button size='sm' variant='outline' asChild className="rounded-xl border-gray-300 hover:border-blue-400 hover:text-blue-600 transition-all duration-200">
              <Link
                to={{
                  pathname: path.register,
                  search: createSearchParams({
                    status: registerStatus.create
                  }).toString()
                }}
              >
                Đăng ký
              </Link>
            </Button>
            <Button size='sm' asChild className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200">
              <Link to={path.login}>Đăng nhập</Link>
            </Button>
          </div>
        )}

        {isAuthenticated && (
          <div className='flex items-center space-x-3'>
            <HeaderNotification />
            
            {[ROLE.consultant, ROLE.user, ROLE.advisor].includes(role as any) && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 group" 
                asChild
              >
                <Link to={path.messages}>
                  <MessageCircle className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-600 text-white border-2 border-white shadow-lg animate-bounce">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                  )}
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </header>
  )
}

export default function MainLayout({ children }: { readonly children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <Header />
      <div className='mt-[var(--header-height)] min-h-remain-screen'>
        {children}
      </div>
    </div>
  )
}
