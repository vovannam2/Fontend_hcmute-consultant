import axios from 'axios'


const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: false, // bật true nếu backend cần cookie
})


// Gắn token vào header
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})


// Xử lý 401
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err?.response?.status === 401) {
            localStorage.removeItem('token')
            // window.location.href = '/login' // tuỳ chọn
        }
        return Promise.reject(err)
    }
)


export default api