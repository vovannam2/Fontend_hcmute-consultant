// Component demo để test Mock API
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MOCK_CONFIG } from '@/config/mock.config'
import { 
  mockGetConversations, 
  mockGetChatHistory, 
  mockCreateUserConversation,
  mockCreateGroupConversation,
  mockDeleteConversation 
} from '@/mocks/chat.mock'

export default function MockApiDemo() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])

  const testApi = async (apiName: string, apiCall: () => Promise<any>) => {
    setIsLoading(true)
    try {
      console.log(`🧪 Testing ${apiName}...`)
      const result = await apiCall()
      setResults(prev => [...prev, { api: apiName, result, timestamp: new Date().toLocaleTimeString() }])
      console.log(`✅ ${apiName} success:`, result)
    } catch (error) {
      console.error(`❌ ${apiName} error:`, error)
      setResults(prev => [...prev, { api: apiName, error: (error as Error).message, timestamp: new Date().toLocaleTimeString() }])
    } finally {
      setIsLoading(false)
    }
  }

  const clearResults = () => {
    setResults([])
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🧪 Mock API Demo
            <Badge variant={MOCK_CONFIG.ENABLE_MOCK ? "default" : "secondary"}>
              {MOCK_CONFIG.ENABLE_MOCK ? "Mock ON" : "Mock OFF"}
            </Badge>
          </CardTitle>
          <CardDescription>
            Test các API mock để kiểm tra dữ liệu và giao diện
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <Button 
              onClick={() => testApi('getConversations', () => mockGetConversations({ page: '0', size: '20', sortBy: 'createdAt', sortDir: 'desc' }))}
              disabled={isLoading}
              variant="outline"
            >
              Test Get Conversations
            </Button>
            
            <Button 
              onClick={() => testApi('getChatHistory (ID: 1)', () => mockGetChatHistory({ conversationId: 1, page: 0, size: 1000, sortBy: '', sortDir: 'asc' }))}
              disabled={isLoading}
              variant="outline"
            >
              Test Get Chat History
            </Button>
            
            <Button 
              onClick={() => testApi('createUserConversation', () => mockCreateUserConversation({ consultantId: '2', departmentId: '1' }))}
              disabled={isLoading}
              variant="outline"
            >
              Test Create User Chat
            </Button>
            
            <Button 
              onClick={() => testApi('createGroupConversation', () => mockCreateGroupConversation({ name: 'Test Group' }))}
              disabled={isLoading}
              variant="outline"
            >
              Test Create Group Chat
            </Button>
            
            <Button 
              onClick={() => testApi('deleteConversation', () => mockDeleteConversation(1))}
              disabled={isLoading}
              variant="outline"
            >
              Test Delete Conversation
            </Button>
            
            <Button 
              onClick={clearResults}
              disabled={isLoading}
              variant="destructive"
            >
              Clear Results
            </Button>
          </div>

          {isLoading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Đang test API...</p>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Kết quả test:</h3>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {results.map((result, index) => (
                  <Card key={index} className="p-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{result.api}</Badge>
                      <span className="text-xs text-muted-foreground">{result.timestamp}</span>
                    </div>
                    {result.error ? (
                      <p className="text-red-500 text-sm mt-1">❌ {result.error}</p>
                    ) : (
                      <p className="text-green-600 text-sm mt-1">✅ Success - Check console for details</p>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">📋 Hướng dẫn sử dụng:</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Bật Mock Mode trong <code>src/config/mock.config.ts</code></li>
              <li>• Kiểm tra console để xem chi tiết API calls</li>
              <li>• Dữ liệu mock được lưu trong <code>src/mocks/chat.mock.ts</code></li>
              <li>• Có thể tùy chỉnh delay và dữ liệu theo nhu cầu</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
