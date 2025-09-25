// Cấu hình mock API
export const MOCK_CONFIG = {
  // Bật/tắt mock mode
  ENABLE_MOCK: true,
  
  // Delay giả lập network (ms)
  NETWORK_DELAY: {
    FAST: 200,
    NORMAL: 500,
    SLOW: 1000
  },
  
  // Các API được mock
  MOCKED_APIS: {
    CONVERSATIONS: true,
    CHAT_HISTORY: true,
    CREATE_CONVERSATION: true,
    UPDATE_MESSAGE: true,
    DELETE_CONVERSATION: true
  }
}

// Hàm kiểm tra xem có nên mock API không
export const shouldMockApi = (apiName: keyof typeof MOCK_CONFIG.MOCKED_APIS): boolean => {
  return MOCK_CONFIG.ENABLE_MOCK && MOCK_CONFIG.MOCKED_APIS[apiName]
}
