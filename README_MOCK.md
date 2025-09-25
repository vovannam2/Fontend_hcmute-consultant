# 🚀 Hướng dẫn Mock API cho Chat System

## ⚡ Quick Start

### 1. Bật Mock Mode
```typescript
// src/config/mock.config.ts
export const MOCK_CONFIG = {
  ENABLE_MOCK: true,  // ← Bật mock
  // ...
}
```

### 2. Chạy ứng dụng
```bash
npm run dev
```

### 3. Kiểm tra giao diện
- Mở trang `/chats` hoặc `/messages`
- Xem danh sách cuộc trò chuyện
- Click vào từng cuộc trò chuyện để xem chat

## 📊 Dữ liệu Mock có sẵn

- **4 cuộc trò chuyện** với dữ liệu đa dạng
- **Lịch sử chat** đầy đủ cho mỗi cuộc trò chuyện
- **Avatar và tên** thực tế
- **Thời gian** được tính toán động

## 🛠️ Tùy chỉnh

### Thêm cuộc trò chuyện mới
Sửa file `src/mocks/chat.mock.ts` → thêm vào `mockConversations`

### Thay đổi delay
Sửa file `src/config/mock.config.ts` → `NETWORK_DELAY`

### Tắt Mock
```typescript
// src/config/mock.config.ts
ENABLE_MOCK: false
```

## 🎯 Test Demo

Thêm component `MockApiDemo` vào trang để test:

```tsx
import MockApiDemo from '@/components/dev/MockApiDemo'

// Trong component
<MockApiDemo />
```

## 📁 Files quan trọng

- `src/mocks/chat.mock.ts` - Dữ liệu mock
- `src/config/mock.config.ts` - Cấu hình mock
- `src/apis/*.api.mock.ts` - Wrapper APIs
- `MOCK_API_GUIDE.md` - Hướng dẫn chi tiết

---

**Chúc bạn test thành công! 🎉**
