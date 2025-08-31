import { useEffect, useState } from 'react'
import { getProfile, updateProfile } from '../services/auth'
import { useNavigate } from 'react-router-dom'

export default function Profile() {
    const [data, setData] = useState(null)
    const [fullName, setFullName] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const navigate = useNavigate()
    useEffect(() => {
        const fetchMe = async () => {
            try {
                const res = await getProfile()
                setData(res.data)
                // Thử các trường tên khác nhau tuỳ backend
                setFullName(res?.data?.fullName || res?.data?.name || '')
            } catch (err) {
                // Nếu token hết hạn hoặc không hợp lệ
                if (err?.response?.status === 401) {
                    localStorage.removeItem('token')
                    navigate('/login')
                } else {
                    alert(err?.response?.data?.message || 'Không lấy được thông tin')
                }
            } finally {
                setLoading(false)
            }
        }
        fetchMe()
    }, [navigate])
    const onSave = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            // Gửi payload chứa trường tên; nếu backend khác, sửa ở đây
            await updateProfile({ fullName })
            alert('Cập nhật thành công')
            const res = await getProfile()
            setData(res.data)
        } catch (err) {
            alert(err?.response?.data?.message || 'Lỗi cập nhật')
        } finally {
            setSaving(false)
        }
    }
    if (loading) return <p className="text-center mt-8">Đang tải...</p>


    return (
        <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Hồ sơ</h2>
            {data && (
                <>
                    <p className="text-gray-700 mb-3"><b>Email:</b> {data.email}</p>
                    <form onSubmit={onSave} className="space-y-3">
                        <input
                            className="w-full border p-2 rounded"
                            placeholder="Họ tên"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                        />
                        <button disabled={saving} className="w-full bg-blue-600 text-white p-2 rounded">
                            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                    </form>
                </>
            )}
        </div>
    )
}