import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import useRouteElement from './hooks/useRouteElement'

function App() {
  const routeElement = useRouteElement()
  const queryClient = new QueryClient()
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {routeElement}
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App;
