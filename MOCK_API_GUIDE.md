# 🚀 Hướng dẫn Mock API cho hệ thống Chat

## 📋 Tổng quan

Hệ thống mock API này cho phép bạn test giao diện chat mà không cần backend thật. Tất cả dữ liệu được tạo sẵn và có thể dễ dàng tùy chỉnh.

## 🛠️ Cách sử dụng

### 1. Bật/tắt Mock Mode

Mở file `src/config/mock.config.ts`:

```typescript
export const MOCK_CONFIG = {
  // Bật/tắt mock mode
  ENABLE_MOCK: true,  // Đổi thành false để tắt mock
  
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
```

### 2. Cập nhật import trong các component

Thay vì import từ file API gốc, hãy import từ file mock:

**Trước:**
```typescript
import { getConversations } from '@/apis/conversation.api'
import { getChatHistory } from '@/apis/chat.api'
```

**Sau:**
```typescript
import { getConversations } from '@/apis/conversation.api.mock'
import { getChatHistory } from '@/apis/chat.api.mock'
```

### 3. Các file cần cập nhật

- `src/pages/User/Chats/Chats.tsx`
- `src/pages/User/Message/Message.tsx`
- `src/components/dev/Chat/Chat.tsx`
- `src/components/dev/MessageItem/MessageItem.tsx`
- `src/pages/User/Message/components/CreateNewConversation.tsx`

## 📊 Dữ liệu Mock có sẵn

### Cuộc trò chuyện (Conversations)
- **4 cuộc trò chuyện** với dữ liệu đa dạng
- **2 cuộc trò chuyện cá nhân** (1-1)
- **2 cuộc trò chuyện nhóm** (group)
- **Thông tin phòng ban** khác nhau
- **Avatar và tên** thực tế

### Lịch sử chat
- **Tin nhắn đa dạng** với nội dung thực tế
- **Thời gian** được tính toán động
- **Trạng thái tin nhắn** (đã gửi, đã thu hồi, đã chỉnh sửa)
- **Hình ảnh avatar** từ Unsplash

## 🎨 Tùy chỉnh dữ liệu Mock

### Thêm cuộc trò chuyện mới

Mở file `src/mocks/chat.mock.ts` và thêm vào mảng `mockConversations`:

```typescript
{
  id: 5,
  department: {
    id: 3,
    name: 'Khoa Kinh tế'
  },
  name: 'Tư vấn về Marketing',
  isGroup: false,
  createdAt: '2024-01-16T08:00:00Z',
  members: [
    {
      id: 1,
      name: 'Nguyễn Văn A',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      sender: true
    },
    {
      id: 7,
      name: 'Cô Hương',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
      sender: false
    }
  ]
}
```

### Thêm lịch sử chat

Thêm vào mảng `mockChatHistory` tương ứng:

```typescript
{
  id: 13,
  conversationId: 5,
  date: '2024-01-16T08:00:00Z',
  message: 'Chào cô, em muốn hỏi về marketing digital',
  imageUrl: '',
  messageStatus: null,
  sender: {
    id: 1,
    name: 'Nguyễn Văn A',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
  },
  receiver: [
    {
      id: 7,
      name: 'Cô Hương',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face'
    }
  ],
  recalledBySender: false,
  recalledForEveryone: false,
  edited: false,
  editedDate: ''
}
```

## 🔧 Tính năng Mock

### 1. Delay Network
- Giả lập thời gian tải dữ liệu
- Có thể điều chỉnh trong `mock.config.ts`

### 2. Console Logging
- Tất cả API calls được log ra console
- Dễ dàng debug và theo dõi

### 3. Error Simulation
- Có thể thêm logic giả lập lỗi
- Test các trường hợp edge case

### 4. Real-time Updates
- Mock data có thể được cập nhật real-time
- Phù hợp cho testing

## 🚨 Lưu ý quan trọng

1. **Luôn backup** dữ liệu thật trước khi test
2. **Tắt mock mode** khi deploy production
3. **Kiểm tra console** để debug
4. **Cập nhật types** nếu thay đổi cấu trúc dữ liệu

## 🎯 Các bước test

1. **Bật mock mode** trong `mock.config.ts`
2. **Cập nhật imports** trong các component
3. **Chạy ứng dụng** và kiểm tra giao diện
4. **Test các chức năng**:
   - Xem danh sách cuộc trò chuyện
   - Chọn cuộc trò chuyện
   - Xem lịch sử chat
   - Tạo cuộc trò chuyện mới
   - Xóa cuộc trò chuyện

## 🔄 Chuyển đổi giữa Mock và Real API

### Để sử dụng Real API:
```typescript
// Trong mock.config.ts
export const MOCK_CONFIG = {
  ENABLE_MOCK: false,  // Tắt mock
  // ...
}
```

### Để sử dụng Mock API:
```typescript
// Trong mock.config.ts
export const MOCK_CONFIG = {
  ENABLE_MOCK: true,   // Bật mock
  // ...
}
```

## 📝 Troubleshooting

### Lỗi import:
- Kiểm tra đường dẫn import
- Đảm bảo file mock đã được tạo

### Dữ liệu không hiển thị:
- Kiểm tra console log
- Xác nhận mock mode đã bật
- Kiểm tra cấu trúc dữ liệu

### Performance chậm:
- Giảm `NETWORK_DELAY` trong config
- Kiểm tra số lượng dữ liệu mock

---

**Chúc bạn test thành công! 🎉**
