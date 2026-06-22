# CourtMate - Sports Aggregator & Matchmaking Platform

CourtMate là ứng dụng di động đa nền tảng (React Native / Expo) và hệ thống Backend (NestJS, MongoDB, Redis) giúp người chơi thể thao phong trào nhanh chóng kết nối, ghép cặp chơi thể thao tức thì (Grab-like matchmaking) và đặt lịch sân đấu theo thời gian thực tại địa phương.

---

## 👥 Bảng Phân Chia Công Việc (Team Assignments)

Dự án được chia thành **8 phase** phát triển cho nhóm 4 thành viên. Mỗi thành viên chịu trách nhiệm chính **2 phase** (đan xen giữa Frontend và Backend):

| Phase | Thành viên phụ trách | Nhiệm vụ chính |
| :--- | :--- | :--- |
| **Phase 1** | **Duẫn (Lần 1)** | **Authentication & Profiles**: Thiết lập hệ thống đăng nhập, hồ sơ người dùng và cấu hình vai trò (Cầu thủ vs Ban tổ chức). |
| **Phase 2** | **Đông (Lần 1)** | **Tournament Hub - Discovery**: Giao diện duyệt danh sách giải đấu địa phương và trang hiển thị chi tiết điều lệ giải. |
| **Phase 3** | **Phúc (Lần 1)** | **Tournament Creation Workflow**: Biểu mẫu và luồng xử lý cho Ban tổ chức tự tạo giải đấu (môn chơi, lệ phí, số lượng cặp đấu). |
| **Phase 4** | **Thịnh (Lần 1)** | **Player Registration Forms**: Biểu mẫu đăng ký tham gia thi đấu (điền thông tin đồng đội, trình độ) và trang theo dõi trạng thái. |
| **Phase 5** | **Duẫn (Lần 2)** | **Registration Management & Bookmarks**: Giao diện cho Ban tổ chức phê duyệt hồ sơ đăng ký và tính năng Lưu trữ (Bookmarks) giải đấu của Cầu thủ. |
| **Phase 6** | **Đông (Lần 2)** | **Advanced Filter & Search**: Bộ lọc đa tiêu chí (mức phí, khu vực quận huyện, môn chơi) và công cụ tìm kiếm thông minh. |
| **Phase 7** | **Phúc (Lần 2)** | **Community Trust & Reports**: Tích xanh xác thực cho Ban tổ chức uy tín (Verified Badge) và cơ chế báo cáo giải đấu rác/giả mạo. |
| **Phase 8** | **Thịnh (Lần 2)** | **Multi-Region Scaling & Admin**: Định tuyến hiển thị giải đấu tự động theo vị trí và trang Dashboard cho quản trị viên khu vực. |

---

## 🛠️ Yêu Cầu Hệ Thống (Prerequisites)

Trước khi bắt đầu, hãy đảm bảo máy tính của bạn đã cài đặt các công cụ sau:
- **Node.js** (Phiên bản `>= 18.x` trở lên)
- **Docker Desktop** (Để khởi chạy MongoDB và Redis ảo hóa)
- **Git**

---

## 🚀 Các Bước Cài Đặt Dự Án (Setup Instructions)

Thực hiện các lệnh sau tại thư mục gốc (`d:\EXE101`):

### Bước 1: Thiết lập File Môi Trường (.env)
Sao chép các file cấu hình môi trường từ mẫu có sẵn:

*Trên Linux / macOS / Git Bash:*
```bash
cp .env.example .env
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
```

*Trên Windows PowerShell:*
```powershell
copy .env.example .env
copy apps/backend/.env.example apps/backend/.env
copy apps/frontend/.env.example apps/frontend/.env
```

> [!TIP]
> Bạn có thể mở các file `.env` vừa tạo để chỉnh sửa cổng kết nối hoặc thông tin tài khoản nếu cần thiết.

### Bước 2: Cài Đặt Thư Viện (NPM Dependencies)
Dự án sử dụng cơ chế **NPM Workspaces** để quản lý monorepo. Bạn chỉ cần chạy cài đặt duy nhất 1 lần ở thư mục root:
```bash
npm install
```
Lệnh này sẽ tự động liên kết các package dùng chung (`@courtmate/shared`) và cài đặt dependencies cho cả frontend và backend.

### Bước 3: Khởi Động Cơ Sở Dữ Liệu (Docker Containers)
Mở phần mềm Docker Desktop lên, sau đó chạy lệnh sau ở thư mục root để bật MongoDB, Redis và Mongo-Express:
```bash
npm run docker:up
```
Để dừng các container khi không sử dụng nữa:
```bash
npm run docker:down
```

---

## 🗄️ Quản Lý Database Migrations (Dữ liệu Mẫu & Schema)

Dự án sử dụng `migrate-mongo` để khởi tạo dữ liệu mẫu và đồng bộ cấu hình database.

### 1. Tự động chạy khi khởi động
Khi bạn khởi chạy ứng dụng backend (NestJS), hệ thống sẽ **tự động quét và áp dụng** các bản migration chưa chạy. Bạn không cần làm gì thêm.

### 2. Chạy thủ công qua câu lệnh ở root
Nếu bạn muốn thao tác trực tiếp, hãy chạy các lệnh sau ngay tại thư mục root của dự án:

- **Chạy tất cả migrations chưa áp dụng**:
  ```bash
  npm run migration
  ```
- **Kiểm tra trạng thái các bản migration**:
  ```bash
  npm run migration:status
  ```
- **Hủy bỏ (Rollback) bản migration gần nhất**:
  ```bash
  npm run migration:down
  ```
- **Tạo một bản migration mới**:
  ```bash
  npm run migration:create -- <ten_migration>
  ```
  *(Các file migration mới sẽ được tạo trong thư mục `apps/backend/migrations/`)*

---

## 💻 Chạy Ứng Dụng Trong Quá Trình Phát Triển (Development Run)

Mở 2 cửa sổ terminal tại thư mục root và chạy song song:

### 1. Khởi chạy Backend (NestJS API)
```bash
npm run backend:dev
```
API sẽ chạy tại địa chỉ: [http://localhost:3000](http://localhost:3000).

### 2. Khởi chạy Frontend (Expo App)
```bash
npm run frontend:dev
```
Terminal sẽ hiển thị QR Code của Expo. Bạn có thể:
- Quét QR bằng app **Expo Go** trên điện thoại (iOS/Android).
- Nhấn `a` để chạy trên máy ảo Android.
- Nhấn `i` để chạy trên máy ảo iOS.
- Nhấn `w` để chạy trên trình duyệt web.

---

## 🔌 Danh Sách Địa Chỉ & Cổng Dịch Vụ (Exposed Ports)

Khi các dịch vụ Docker và Apps đang chạy, bạn có thể truy cập:

- **NestJS REST API**: [http://localhost:3000](http://localhost:3000)
- **MongoDB Server**: `mongodb://localhost:27017` (Tài khoản mặc định: `root` / `examplepassword`)
- **Redis Server**: `localhost:6379`
- **Mongo-Express (Giao diện Web Quản lý Database)**: [http://localhost:8081](http://localhost:8081)
  - *Tài khoản đăng nhập web*: `admin` / `adminpassword`

---

## 📂 Cấu Trúc Thư Mục Dự Án (Folder Structure)

```
courtmate-monorepo/
 ┣ apps/
 ┃ ┣ backend/            # NestJS Backend Application
 ┃ ┃ ┣ src/              # Mã nguồn API & Domain Use-cases
 ┃ ┃ ┣ migrations/       # Các file migration/seed dữ liệu DB
 ┃ ┃ ┗ migrate-mongo-config.js
 ┃ ┗ frontend/           # Expo React Native App (Tamagui + NativeWind)
 ┣ packages/
 ┃ ┗ shared/             # Thư viện TypeScript dùng chung (Enums, Types, Interfaces)
 ┣ docker-compose.yml    # Khởi tạo MongoDB, Redis & Mongo-Express
 ┗ package.json          # Quản lý Workspaces & Các Script chạy nhanh ở root
```
