# 🚀 Quick Start - Mock API cho Chat System

## ✅ Đã sửa xong lỗi TypeScript!

Tất cả lỗi TypeScript đã được sửa. Bây giờ bạn có thể sử dụng mock API mà không gặp lỗi.

## 🎯 Cách sử dụng ngay:

### 1. Bật Mock Mode
```typescript
// src/config/mock.config.ts
export const MOCK_CONFIG = {
  ENABLE_MOCK: true,  // ← Đã bật sẵn
  // ...
}
```

### 2. Chạy ứng dụng
```bash
npm run dev
```

### 3. Mở trang chat
- Truy cập `/chats` hoặc `/messages`
- Xem danh sách cuộc trò chuyện
- Click vào từng cuộc trò chuyện để xem chat

## 📊 Dữ liệu Mock có sẵn:

- ✅ **4 cuộc trò chuyện** với dữ liệu đa dạng
- ✅ **Lịch sử chat** đầy đủ cho mỗi cuộc trò chuyện  
- ✅ **Avatar thực tế** từ Unsplash
- ✅ **Thời gian** được tính toán động
- ✅ **Delay network** giả lập thực tế

## 🔧 Các tính năng đã hoạt động:

- ✅ Hiển thị danh sách cuộc trò chuyện
- ✅ Chọn cuộc trò chuyện
- ✅ Xem lịch sử chat
- ✅ Tạo cuộc trò chuyện mới (User)
- ✅ Tạo cuộc trò chuyện nhóm (Consultant)
- ✅ Xóa cuộc trò chuyện
- ✅ Tìm kiếm cuộc trò chuyện

## 🎨 Tùy chỉnh dữ liệu:

### Thêm cuộc trò chuyện mới:
```typescript
// src/mocks/chat.mock.ts
// Thêm vào mảng mockConversations
{
  id: 5,
  department: { id: 3, name: 'Khoa Kinh tế' },
  name: 'Tư vấn Marketing',
  isGroup: false,
  createdAt: '2024-01-16T08:00:00Z',
  members: [/* ... */]
}
```

### Thay đổi delay:
```typescript
// src/config/mock.config.ts
NETWORK_DELAY: {
  FAST: 100,    // ← Giảm delay
  NORMAL: 300,
  SLOW: 500
}
```

## 🔄 Chuyển đổi Mock ↔ Real API:

**Sử dụng Mock:**
```typescript
ENABLE_MOCK: true
```

**Sử dụng Real API:**
```typescript
ENABLE_MOCK: false
```

## 🐛 Debug:

- Mở **Console** để xem API calls
- Tất cả API calls được log ra console
- Kiểm tra network tab để xem delay

## 📁 Files quan trọng:

- `src/mocks/chat.mock.ts` - Dữ liệu mock
- `src/config/mock.config.ts` - Cấu hình
- `src/apis/*.api.mock.ts` - Wrapper APIs
- `MOCK_API_GUIDE.md` - Hướng dẫn chi tiết

---

**🎉 Chúc bạn test thành công!**
