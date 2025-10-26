import useRouteElement from '@/hooks/useRouteElement'

export default function App() {
  // gọi hook lấy toàn bộ cây route
  const element = useRouteElement()
  
  // render router
  return element
}