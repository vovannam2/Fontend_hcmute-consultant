import { useSearchParams } from 'react-router-dom'

export default function useQueryParams() {
  const [searchParams] = useSearchParams()
  return Object.fromEntries([...searchParams])
}
// lấy ra tất cả các query params và trả về một object ví dụ 
// http://localhost:3000/chats?page=0&size=5&sortBy=createdAt&sortDir=desc&name=
// trả về {page: '0', size: '5', sortBy: 'createdAt', sortDir: 'desc', name: ''}
// nếu không có query params thì trả về {}
// nếu có query params thì trả về object với các query params
// nếu có nhiều query params thì trả về object với các query params
// nếu có nhiều query params thì trả về object với các query params
