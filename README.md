# 💻 HCMUTE Student Consulting System – Frontend

**Status:** 🚀 In Development  
**Frameworks:** ReactJS + ExpressJS  
**Styling:** Tailwind CSS  
**Database:** MongoDB (Mongoose)

---

## 🏫 Giới thiệu

Dự án **HCMUTE Student Consulting System – Frontend** là giao diện người dùng của nền tảng **tư vấn sinh viên trực tuyến** dành cho **Trường Đại học Sư phạm Kỹ thuật TP.HCM (HCMUTE)**.  
Website giúp sinh viên đặt câu hỏi, nhận phản hồi từ tư vấn viên, đọc bài viết chia sẻ kiến thức và trò chuyện trực tiếp.

Ứng dụng được phát triển với:
- **Frontend:** ReactJS + Tailwind CSS  
- **Backend:** NodeJS + ExpressJS + MongoDB (Mongoose)  
- **Giao tiếp API:** Axios, RESTful API

---

## 📚 Mục lục
- [Tổng quan](#-tổng-quan)
- [Tính năng chính](#-tính-năng-chính)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Cài đặt & Chạy dự án](#️-cài-đặt--chạy-dự-án)
- [Kết nối Backend](#-kết-nối-backend)
- [Tác giả](#-tác-giả)

---

## 📌 Tổng quan

Website hướng đến việc cung cấp một nền tảng hiện đại, thân thiện cho sinh viên HCMUTE với các tính năng:
- Hỏi – đáp nhanh chóng giữa sinh viên và tư vấn viên  
- Theo dõi bài viết chia sẻ kiến thức  
- Giao tiếp và nhận thông báo thời gian thực  
- Quản lý tài khoản, hồ sơ, và lịch tư vấn  

---

## ✨ Tính năng chính

| Nhóm | Mô tả |
|------|-------|
| 👨‍🎓 **Sinh viên** | Đăng ký, đăng nhập, gửi câu hỏi, xem phản hồi, trò chuyện |
| 👩‍🏫 **Tư vấn viên** | Quản lý hồ sơ, trả lời câu hỏi, viết bài tư vấn |
| 🧑‍💼 **Admin** | Quản lý người dùng, lĩnh vực, phòng ban |
| 💬 **Chat** | Trò chuyện thời gian thực với Socket.IO |
| ☁️ **Upload** | Quản lý hình ảnh người dùng, bài viết (Cloudinary) |

---

## 🧱 Cấu trúc dự án

```bash
frontend/
├── public/
│   ├── index.html          # File HTML gốc
│   └── assets/             # Hình ảnh, favicon
├── src/
│   ├── api/                # Kết nối backend (axios client, API service)
│   ├── components/         # Các component tái sử dụng (Button, Modal, Navbar,...)
│   ├── pages/              # Các trang (Home, Login, Dashboard,...)
│   ├── context/            # React Context (auth, theme,...)
│   ├── hooks/              # Custom hooks (useAuth, useFetch,...)
│   ├── styles/             # Cấu hình Tailwind, file CSS chung
│   ├── utils/              # Hàm tiện ích
│   ├── App.jsx             # Component gốc
│   └── main.jsx            # Entry point chính (ReactDOM.render)
├── .env.example
├── package.json
└── README.md
| **Mảng**                  | **Công nghệ sử dụng**                                                        |
| ------------------------- | ---------------------------------------------------------------------------- |
| **Frontend Framework**    | [Next.js 14](https://nextjs.org/)                                            |
| **Ngôn ngữ**              | [TypeScript](https://www.typescriptlang.org/)                                |
| **UI Framework**          | [TailwindCSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/) |
| **Chart & Visualization** | [Recharts](https://recharts.org/)                                            |
| **HTTP Client**           | [Axios](https://axios-http.com/)                                             |
| **Icons**                 | [Lucide React](https://lucide.dev/icons)                                     |
| **Font**                  | [Geist Font](https://vercel.com/fonts/geist)                                 |
| **State Management**      | React Hooks / Context API                                                    |
| **Auth Integration**      | JWT Token (localStorage)                                                     |
| **Build Tool**            | [Vite](https://vitejs.dev/)                                                  |
| **Deployment**            | [Vercel](https://vercel.com/) / [Netlify](https://www.netlify.com/)          |
