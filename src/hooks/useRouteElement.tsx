import { Routes, Route, Navigate } from 'react-router-dom'
import Login from '@/pages/Auth/Login'
import Register from '@/pages/Auth/Register'
import ForgotPassword from '@/pages/Auth/ForgotPassword'
import OAuth2RedirectHandler from '@/pages/Auth/OAuth2RedirectHandler'
import Chats from '@/pages/User/Chats'
import Message from '@/pages/User/Message'

export default function useRouteElement() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
      <Route path="/chats" element={<Chats />} />
      {/* <Route path="/messages" element={<Message />} /> */}
      <Route path="*" element={<Navigate to="/login" replace />} />
      {/* Thêm các route khác ở đây nếu muốn */}
    </Routes>
  )
}