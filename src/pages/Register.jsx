import { useState } from 'react'
import { registerRequest, registerVerify } from '../services/auth'
import { useNavigate, Link } from 'react-router-dom'

export default function Register() {
  const [step, setStep] = useState(1)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleRegisterRequest = async (e) => {
    e.preventDefault()
    if (password !== confirm) return alert('Mật khẩu nhập lại không khớp')
    setLoading(true)
    try {
      await registerRequest({ fullName, email, password })
      alert('OTP đã gửi đến email, vui lòng kiểm tra hộp thư')
      setStep(2)
    } catch (err) {
      alert(err?.response?.data?.error || 'Lỗi đăng ký bước 1')
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterVerify = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await registerVerify({ email, code: otp })
      alert('Đăng ký thành công! Mời đăng nhập')
      navigate('/login')
    } catch (err) {
      alert(err?.response?.data?.error || 'Lỗi xác thực OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Đăng ký</h2>

      {step === 1 && (
        <form onSubmit={handleRegisterRequest} className="space-y-3">
          <input className="w-full border p-2 rounded" placeholder="Họ tên"
            value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <input className="w-full border p-2 rounded" type="email" placeholder="Email"
            value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="w-full border p-2 rounded" type="password" placeholder="Mật khẩu"
            value={password} onChange={(e) => setPassword(e.target.value)} />
          <input className="w-full border p-2 rounded" type="password" placeholder="Nhập lại mật khẩu"
            value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          <button disabled={loading} className="w-full bg-gray-900 text-white p-2 rounded">
            {loading ? 'Đang xử lý...' : 'Gửi OTP'}
          </button>
          <p className="text-sm text-gray-600">Đã có tài khoản? <Link to="/login" className="text-blue-600">Đăng nhập</Link></p>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleRegisterVerify} className="space-y-3">
          <input className="w-full border p-2 rounded" placeholder="Nhập OTP từ email"
            value={otp} onChange={(e) => setOtp(e.target.value)} />
          <button disabled={loading} className="w-full bg-green-600 text-white p-2 rounded">
            {loading ? 'Đang xử lý...' : 'Xác thực OTP'}
          </button>
        </form>
      )}
    </div>
  )
}
