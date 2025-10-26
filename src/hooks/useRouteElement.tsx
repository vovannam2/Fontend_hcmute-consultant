import { useContext } from 'react'
import { Navigate, Outlet, useRoutes } from 'react-router-dom'

import path from '@/constants/path'
import { AppContext } from '@/contexts/app.context'

import { ROLE, Role } from '@/constants/role'
import UserLayout from '@/layouts/UserLayout'
import AuthLayout from '@/layouts/AuthLayout'
import Home from '@/pages/User/Home'
import Login from '@/pages/Auth/Login'
import Register from '@/pages/Auth/Register'
import MainLayout from '@/layouts/MainLayout'

import AsideNav from '@/pages/User/Home/components/AsideNav/AsideNav'
import CreateQuestion from '@/pages/User/CreateQuestion/CreateQuestion'
import MyQuestion from '@/pages/User/MyQuestion/MyQuestion'
import Message from '@/pages/User/Message/Message'
import Profile from '@/pages/User/Profile'
import ChangePassword from '@/pages/User/ChangePassword'
import NotificationPage from '@/components/NotificationPage/NotificationPage'
import ManageLayout from '@/layouts/ManageLayout'
import ManageQuestion from '@/pages/Manage/ManageQuestion/ManageQuestion'
import QuestionDetail from '@/pages/Manage/QuestionDetail/QuestionDetail'
import LayoutWrapper from '@/components/LayoutWrapper'
import ManageForwardQuestion from '@/pages/Manage/ManageForwardQuestion/ManageForwardQuestion'
import ManagePost from '@/pages/Manage/ManagePost/ManagePost'
import PostDetail from '@/pages/Manage/PostDetail/PostDetail'
import ManageSchedual from '@/pages/Manage/ManageSchedual'
import SchedualDetail from '@/pages/Manage/SchedualDetail'
import ScheduleActivityDetail from '@/pages/User/ScheduleActivityDetail/ScheduleActivityDetail'
import ConsultantPage from '@/pages/User/Consultant'
import ConsultantDetail from '@/pages/User/ConsultantDetail'
import Consultation from '@/pages/User/Consultation'
import UserPostDetail from '@/pages/User/PostDetail'

function ProtectedRoute() {
  const { isAuthenticated } = useContext(AppContext)
  return isAuthenticated ? <Outlet /> : <Navigate to={path.login} />
}

function ProtectedManageRoute() {
  const { role } = useContext(AppContext)
  return [ROLE.admin as Role, ROLE.advisor as Role, ROLE.consultant as Role].includes(role as Role) ? (
    <Outlet />
  ) : (
    <Navigate to={path.home} />
  )
}

function RejectedRoute() {
  const { isAuthenticated } = useContext(AppContext)
  return !isAuthenticated ? <Outlet /> : <Navigate to={path.home} />
}

export default function useRouteElement() {
  const element = useRoutes([
    {
      path: path.home, // "/"
      element: (
        <MainLayout>
          <Home />
        </MainLayout>
      )
    },
    {
      path: path.createQuestion,
      element: (
        <MainLayout>
          <CreateQuestion />
        </MainLayout>
      )
    },
    {
      path: path.messages,
      element: (
        <LayoutWrapper requireAuth={true}>
          <Message />
        </LayoutWrapper>
      )
    },
    {
      path: path.notifications,
      element: (
        <LayoutWrapper requireAuth={true}>
          <NotificationPage />
        </LayoutWrapper>
      )
    },
    {
      path: path.scheduleActivity,
      element: (
        <MainLayout>
          <ScheduleActivityDetail />
        </MainLayout>
      )
    },
    {
      path: path.consultants,
      element: (
        <MainLayout>
          <ConsultantPage />
        </MainLayout>
      )
    },
    {
      path: path.consultantDetail,
      element: (
        <MainLayout>
          <ConsultantDetail />
        </MainLayout>
      )
    },
    {
      path: path.post,
      element: (
        <MainLayout>
          <UserPostDetail />
        </MainLayout>
      )
    },
    {
      path: '/test-aside',
      element: <AsideNav />  // ⬅ Thêm thẳng AsideNav vào đây
    },
    {
      path: path.login, // "/login"
      element: (
        <AuthLayout>
          <Login />
        </AuthLayout>
      )
    },
    {
      path: path.register, // "/register"
      element: (
        <AuthLayout>
          <Register />
        </AuthLayout>
      )
    },
    {
      path: path.user,
      element: (
        <MainLayout>
          <UserLayout />
        </MainLayout>
      ),
      children: [
        {
          path: path.profile,
          element: <Profile />
        },
        {
          path: path.changePassword,
          element: <ChangePassword />
        },
        {
          path: path.myQuestions,
          element: <MyQuestion />
        },
        {
          path: path.consultation,
          element: <Consultation />
        }
      ]
    },
    {
      path: path.manage,
      element: <ManageLayout><Outlet /></ManageLayout>,
      children: [
        {
          path: path.manageQuestion,
          element: <ManageQuestion />
        },
        {
          path: path.questionDetail,
          element: <QuestionDetail />
        },
        {
          path: path.manageForwardQuestion,
          element: <ManageForwardQuestion />
        },
        {
          path: path.managePost,
          element: <ManagePost />
        },
        {
          path: path.postDetail,
          element: <PostDetail />
        },
        {
          path: path.manageSchedule,
          element: <ManageSchedual />
        },
        {
          path: path.schedualDetail,
          element: <SchedualDetail />
        }
      ]
    },
    { path: '*', element: <div>404 Not Found</div> }
  ])
  return element
}

