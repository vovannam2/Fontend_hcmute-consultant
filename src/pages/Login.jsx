import { useState } from 'react'
import { login } from '../services/auth'
import { useNavigate, Link } from 'react-router-dom'


export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()


    const onSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await login({ email, password })
            const token = res?.data?.token
            if (!token) throw new Error('Không nhận được token')
            localStorage.setItem('token', token)
            navigate('/profile')
        } catch (err) {
            alert(err?.response?.data?.message || err.message || 'Lỗi đăng nhập')
        } finally {
            setLoading(false)
        }
    }


    return (
        <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Đăng nhập</h2>
            <form onSubmit={onSubmit} className="space-y-3">
                <input className="w-full border p-2 rounded" type="email" placeholder="Email"
                    value={email} onChange={(e) => setEmail(e.target.value)} />
                <input className="w-full border p-2 rounded" type="password" placeholder="Mật khẩu"
                    value={password} onChange={(e) => setPassword(e.target.value)} />
                <button disabled={loading} className="w-full bg-blue-600 text-white p-2 rounded">
                    {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                </button>
                <p className="text-sm text-gray-600">Quên mật khẩu? <Link to="/forgot-password" className="text-blue-600">Khôi phục</Link></p>
            </form>
        </div>
    )
}