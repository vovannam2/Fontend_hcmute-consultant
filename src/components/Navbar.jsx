import { Link, useNavigate } from 'react-router-dom'


export default function Navbar() {
    const navigate = useNavigate()
    const token = localStorage.getItem('token')


    const logout = () => {
        localStorage.removeItem('token')
        navigate('/login')
    }


    return (
        <nav className="bg-white border-b shadow-sm">
            <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-4">
                <Link to="/" className="font-semibold">HCMUTE Consultant</Link>
                <div className="ml-auto flex items-center gap-3">
                    <Link to="/" className="hover:underline">Home</Link>
                    {!token && (
                        <>
                            <Link to="/login" className="hover:underline">Login</Link>
                            <Link to="/register" className="hover:underline">Register</Link>
                        </>
                    )}
                    {token && (
                        <>
                            <Link to="/profile" className="hover:underline">Profile</Link>
                            <button onClick={logout} className="text-red-600 hover:underline">Logout</button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    )
}