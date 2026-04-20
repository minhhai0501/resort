# Resort Booking Management Auth System

Project quản lý đặt phòng resort full-stack, viết lại hoàn chỉnh theo yêu cầu:

- **Back-end:** Node.js + Express + MongoDB + Mongoose
- **Front-end:** React + JavaScript + HTML + CSS
- **Collections chính:** `users`, `rooms`, `bookings`
- **Xác thực:** JWT
- **Phân quyền:** `admin` và `user`
- **Test API:** Postman collection có sẵn

## Chức năng chính

### Người dùng (user)
- Đăng ký tài khoản
- Đăng nhập / đăng xuất
- Xem danh sách phòng
- Đặt phòng sau khi đăng nhập
- Xem phòng đã đặt
- Hủy booking của chính mình
- Cập nhật thông tin cá nhân
- Đổi mật khẩu

### Quản trị viên (admin)
- Đăng nhập vào khu quản trị
- CRUD người dùng
- CRUD phòng
- CRUD booking
- Xem dashboard thống kê nhanh

## Cấu trúc thư mục

```bash
resort-booking-management-auth/
├─ backend/
│  ├─ config/
│  ├─ controllers/
│  ├─ middleware/
│  ├─ models/
│  ├─ routes/
│  ├─ utils/
│  ├─ server.js
│  └─ seed.js
├─ frontend/
│  ├─ src/
│  │  ├─ components/
│  │  ├─ context/
│  │  └─ pages/
│  └─ vite.config.js
├─ postman/
└─ README.md
```

## Database design

### 1. Users
Lưu tài khoản đăng nhập và phân quyền.

```js
{
  fullName,
  email,
  password,
  phone,
  role: 'admin' | 'user',
  isActive
}
```

### 2. Rooms
Lưu thông tin phòng.

```js
{
  name,
  roomNumber,
  type,
  pricePerNight,
  capacity,
  status,
  amenities,
  description,
  isActive
}
```

### 3. Bookings
Lưu thông tin đặt phòng.

```js
{
  bookingCode,
  user,
  room,
  checkIn,
  checkOut,
  nights,
  guests,
  totalPrice,
  status,
  specialRequest
}
```

## Cách chạy project

## 1) Chạy MongoDB
Có thể dùng:
- MongoDB local
- MongoDB Atlas

## 2) Chạy backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Hoặc seed dữ liệu mẫu:

```bash
npm run seed
```

### Biến môi trường backend

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/resort_booking_auth
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=1d
```

## 3) Chạy frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

### Biến môi trường frontend

```env
VITE_API_URL=http://localhost:5000/api
```

## Tài khoản mẫu sau khi seed

- **Admin**
  - Email: `admin@resort.com`
  - Password: `admin123`

- **User**
  - Email: `user@resort.com`
  - Password: `user123`

## Luồng sử dụng

### Nếu chỉ test API bằng Postman
Chỉ cần chạy:
- MongoDB
- Backend

### Nếu muốn demo giao diện đầy đủ
Cần chạy:
- MongoDB
- Backend
- Frontend

## API chính

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PUT /api/auth/me`
- `PUT /api/auth/change-password`
- `POST /api/auth/logout`

### Users (admin)
- `GET /api/users`
- `POST /api/users`
- `GET /api/users/:id`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`

### Rooms
- `GET /api/rooms`
- `GET /api/rooms/:id`
- `POST /api/rooms` *(admin)*
- `PUT /api/rooms/:id` *(admin)*
- `DELETE /api/rooms/:id` *(admin)*

### Bookings
- `GET /api/bookings/my` *(user)*
- `POST /api/bookings`
- `PUT /api/bookings/:id/cancel`
- `GET /api/bookings` *(admin)*
- `GET /api/bookings/:id`
- `PUT /api/bookings/:id` *(admin)*
- `DELETE /api/bookings/:id` *(admin)*

## Front-end pages

### User pages
- Login
- Register
- Rooms
- My Bookings
- Profile

### Admin pages
- Admin Dashboard
- Admin Rooms
- Admin Users
- Admin Bookings

## Ghi chú kỹ thuật

- Frontend lưu token trong **sessionStorage** để đúng yêu cầu “mỗi khi mở app phải đăng nhập lại” theo hướng demo.
- Backend kiểm tra trùng lịch booking trước khi tạo hoặc cập nhật.
- Không cho khóa user hoặc ẩn room nếu còn booking hoạt động.
- Admin có thể tạo booking hộ khách hàng.

## Postman

File Postman nằm tại:

```bash
postman/Resort-Booking-Management-Auth.postman_collection.json
```

Import file này vào Postman, sau đó chạy lần lượt:
1. Login Admin hoặc Login User
2. Token sẽ được lưu vào biến `authToken`
3. Test các API còn lại
