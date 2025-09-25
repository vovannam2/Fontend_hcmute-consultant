import { Link } from 'react-router-dom'


export default function Home() {
    return (
        <div className="space-y-3">
            <h1 className="text-2xl font-semibold">Hệ thống tư vấn sinh viên</h1>
            <p className="text-gray-600">Trang demo front-end (JS) để kết nối backend Node/Express.</p>
            <div className="flex gap-3">
                <Link to="/login" className="px-4 py-2 bg-blue-600 text-white rounded">Đăng nhập</Link>
                <Link to="/register" className="px-4 py-2 bg-gray-800 text-white rounded">Đăng ký</Link>
            </div>
        </div>
    )
}