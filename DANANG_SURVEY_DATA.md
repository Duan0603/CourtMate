# Hệ Thống Dữ Liệu Khảo Sát Thể Thao Đà Nẵng (CourtMate)

Tài liệu chi tiết về cấu trúc dữ liệu, các bảng (collections) trong MongoDB và trạng thái hiển thị giao diện của dữ liệu khảo sát tại TP. Đà Nẵng.

* **Nguồn dữ liệu:** `BẢNG KHẢO SÁT - ĐÀ NẴNG.xlsx`
* **File Migration:** `apps/backend/migrations/20260710000000-seed-danang-survey-data.js`
* **Cơ sở dữ liệu:** MongoDB Atlas (`courtmate`)

---

## 1. Trạng Thái Hiển Thị Trên Giao Diện (UI Status)

| Loại dữ liệu | Số lượng | Trạng thái hiển thị | Vị trí trên Web |
| :--- | :--- | :--- | :--- |
| **Giải đấu (Tournaments)** | 13 giải đấu | **ĐÃ HIỂN THỊ** | Trang **Khám phá giải đấu** (`/tournaments`) |
| **Cơ sở / Sân thể thao (Venues)** | 50 sân đấu | **CHƯA HIỂN THỊ** | Lưu sẵn trong database (Định hướng làm trang `/venues` - Tìm & Đặt sân) |
| **Ban tổ chức (Organizers)** | 11 tài khoản BTC | **ĐÃ TÍCH HỢP** | Hiển thị tên & tích xanh xác thực (`isVerified`) trên từng thẻ giải đấu |

> [!NOTE]
> * **Giải đấu (`tournaments`):** Được gán `status: "OPEN"`, `city: "Da Nang"`, và `isHidden: false`. Khi người dùng truy cập trang `/tournaments`, API backend `GET /tournaments` sẽ trả về ngay các giải đấu này để lọc và đăng ký thi đấu.
> * **Sân thể thao (`venues`):** Dự án hiện tập trung vào luồng Giải đấu (Discovery, Registration, Management), chưa có trang danh mục sân bãi. Toàn bộ 50 sân đã được lưu trữ hoàn chỉnh kèm tọa độ quận huyện, khung giờ, mức giá để sẵn sàng cho tính năng đặt sân.

---

## 2. Cấu Trúc Bảng Dữ Liệu Trong Database (MongoDB Collections)

### 📋 Bảng 1: `tournaments` (Giải đấu)

Lưu trữ thông tin chi tiết 13 giải đấu thực tế tại Đà Nẵng thuộc 2 bộ môn Cầu lông và Pickleball.

#### Danh sách giải đấu đã seed:
1. `[BADMINTON]` **Laughing Open Mùa 2** (CLB Laughing - Sơn Trà)
2. `[BADMINTON]` **GIẢI CẦU LÔNG FPTU BADMINTON SERIES 2025** (FUB Club x ICPDP - Ngũ Hành Sơn)
3. `[PICKLEBALL]` **Giải Pickleball Queens Đà Nẵng 2026** (Liên đoàn Pickleball Đà Nẵng DPF - Hải Châu)
4. `[PICKLEBALL]` **Giải Pickleball JCI Việt Nam mở rộng 2026** (JCI Hội An - Hòa Cường, Hải Châu)
5. `[PICKLEBALL]` **Giải Pickleball báo chí Đà Nẵng mở rộng 2026** (Hội Nhà báo TP. Đà Nẵng)
6. `[PICKLEBALL]` **Giải Pickleball Học sinh Sinh viên TP. Đà Nẵng 2026 (Cúp FPT City)** (DPF x FPT)
7. `[PICKLEBALL]` **Heineken Pickleball World Cup 2026 – Cá nhân** (BTC World Cup x DPF - Cung Tiên Sơn)
8. `[PICKLEBALL]` **Heineken Pickleball World Cup 2026 – Quốc gia** (BTC World Cup x DPF - Cung Tiên Sơn)
9. `[PICKLEBALL]` **World Junior Pickleball Cup 2026** (BTC World Cup x DPF - Cụm sân Hợp Thành Phát, Sơn Trà)
10. `[PICKLEBALL]` **Giải Pickleball phường Liên Chiểu 2026** (UBND P. Liên Chiểu)
11. `[BADMINTON]` **Giải Vô địch Cầu lông các nhóm tuổi Thiếu niên Quốc gia (Donex)** (Liên đoàn Cầu lông VN x Sở VH-TT)
12. `[BADMINTON]` **Giải Cầu lông Đại hội Thể dục thể thao thành phố Đà Nẵng** (Sở VH-TT-DL Đà Nẵng)
13. `[BADMINTON]` **Giải Cầu lông truyền thống Nhà Văn hóa Lao động** (Nhà VH Lao động TP. Đà Nẵng)

#### Các thuộc tính (Schema Properties):
| Thuộc tính (Field) | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `_id` | `ObjectId` | Mã định danh duy nhất của giải đấu trong MongoDB |
| `title` | `String` | Tên giải đấu |
| `description` | `String` | Mô tả chi tiết: Đơn vị tổ chức, quy mô, thể thức, lưu ý vận hành |
| `sport` | `String` | Bộ môn thể thao: `'BADMINTON'` hoặc `'PICKLEBALL'` |
| `city` | `String` | Thành phố tổ chức: `'Da Nang'` |
| `district` | `String` | Quận huyện: `'Hải Châu'`, `'Sơn Trà'`, `'Ngũ Hành Sơn'`, `'Liên Chiểu'`... |
| `location` | `String` | Địa điểm tổ chức chi tiết (sân đấu, nhà thi đấu) |
| `time` | `String` | Khung thời gian thi đấu dạng chuỗi hiển thị (vd: `"10/10/2026 - 12/10/2026"`) |
| `startDate` | `Date` | Thời điểm bắt đầu giải |
| `endDate` | `Date` | Thời điểm kết thúc giải |
| `organizer` | `Object` | Thông tin BTC: `{ id: string, name: string, isVerified: boolean }` |
| `status` | `String` | Trạng thái: `'OPEN'` (Đang mở đăng ký) |
| `rules` / `rulesText` | `String` | Điều lệ thi đấu, quy định thể thức (Round Robin, Loại trực tiếp...) |
| `categories` | `Array<Object>` | Danh sách các bảng thi đấu: `[{ id, name, fee, maxParticipants }]` |
| `registrationFee` | `Number` | Lệ phí đăng ký thi đấu chuẩn (VNĐ) |
| `slotsLimit` | `Number` | Số lượng vận động viên / cặp tối đa |
| `registrationLink` | `String` | Kênh đăng ký (Google Form, Fanpage, Website chính thức) |
| `isHidden` | `Boolean` | Cờ ẩn/hiện giải đấu (Mặc định `false`) |
| `isFeatured` | `Boolean` | Cờ nổi bật (Mặc định `false`) |
| `reportsCount` | `Number` | Số lượng báo cáo vi phạm (Mặc định `0`) |
| `createdAt` | `Date` | Thời gian tạo bản ghi |
| `updatedAt` | `Date` | Thời gian cập nhật bản ghi gần nhất |

---

### 🏟️ Bảng 2: `venues` (Sân thể thao)

Lưu trữ **50 cơ sở thể thao / sân thi đấu** khảo sát thực tế tại Đà Nẵng:
* 47 sân chuyên Cầu lông.
* 3 cụm sân tích hợp Cầu lông & Pickleball.
* Phân bổ đều tại các quận: *Hải Châu, Ngũ Hành Sơn, Cẩm Lệ, Thanh Khê, Sơn Trà, Liên Chiểu*.

#### Các thuộc tính (Schema Properties):
| Thuộc tính (Field) | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `_id` | `ObjectId` | Mã định danh sân trong MongoDB |
| `code` | `String` | Mã sân khảo sát (`CL1` đến `CL50`) – *Unique Index* |
| `name` | `String` | Tên sân (vd: *Sân cầu lông Ngũ Hành, SÂN CẦU LÔNG INDEXSPORT 2...*) |
| `city` | `String` | Thành phố: `'Da Nang'` |
| `district` | `String` | Quận huyện (Hải Châu, Ngũ Hành Sơn, Cẩm Lệ, Thanh Khê, Sơn Trà, Liên Chiểu) |
| `address` | `String` | Địa chỉ cụ thể của sân đấu |
| `phone` | `String` | Số điện thoại liên hệ đã chuẩn hóa (vd: `"0937132656"`, `"0906507564"`) |
| `contactName` | `String` | Họ tên người liên hệ / chủ sân |
| `contactChannel` | `String` | Kênh liên hệ ưu tiên (vd: `"Điện thoại trực tiếp"`) |
| `surveyor` | `String` | Người thực hiện khảo sát (vd: `"Huân Thành"`) |
| `sports` | `Array<String>` | Môn thể thao: `['BADMINTON']` hoặc `['BADMINTON', 'PICKLEBALL']` |
| `totalCourts` | `Number` | Tổng số lượng sân |
| `badmintonCourts` | `Number` | Số lượng sân cầu lông |
| `pickleballCourts` | `Number` | Số lượng sân pickleball |
| `venueType` | `String` | Loại hình sân: `"Trong nhà (Indoor)"` hoặc `"Ngoài trời (Outdoor)"` |
| `quality` | `String` | Chất lượng mặt sân & hệ thống chiếu sáng (thảm PVC tiêu chuẩn, đèn sáng) |
| `operatingHours` | `String` | Khung giờ hoạt động (vd: `"5h - 23h30"`) |
| `standardPrice` | `Number` | Giá thuê sân giờ thường (VNĐ/giờ) |
| `peakPrice` | `Number` | Giá thuê sân giờ vàng (VNĐ/giờ) |
| `targetAudience` | `String` | Đối tượng khách chính (vd: `"Không giới hạn đối tượng"`) |
| `paymentMethods` | `String` | Phương thức thanh toán (Tiền mặt, chuyển khoản) |
| `createdAt` | `Date` | Thời gian tạo bản ghi |
| `updatedAt` | `Date` | Thời gian cập nhật bản ghi gần nhất |

#### Database Indexes:
* `{ code: 1 }` (unique)
* `{ city: 1, sports: 1 }` (hỗ trợ lọc theo thành phố và môn thể thao)
* `{ district: 1 }` (hỗ trợ lọc theo quận huyện)

---

### 👤 Bảng 3: `users` (Tài khoản Ban tổ chức)

Lưu trữ **11 tài khoản Ban tổ chức** tương ứng với các đơn vị tổ chức giải đấu khảo sát:

#### Danh sách tài khoản BTC:
1. `btc.laughing@courtmate.vn`: CLB Cầu lông Laughing
2. `btc.fub@courtmate.vn`: CLB Cầu lông FUB - FPTU Đà Nẵng
3. `dpf.danang@courtmate.vn`: Liên đoàn Pickleball TP. Đà Nẵng (DPF)
4. `jci.hoian@courtmate.vn`: JCI Hội An & Lãnh đạo Doanh nhân trẻ
5. `nhabaodanang@courtmate.vn`: Hội Nhà báo TP. Đà Nẵng
6. `dpf.fptcity@courtmate.vn`: Ban điều hành Cúp Học sinh SV DPF - FPT City
7. `worldcup.pickleball@courtmate.vn`: Ban tổ chức Pickleball World Cup & DPF
8. `ubnd.lienchieu@courtmate.vn`: UBND Phường Liên Chiểu
9. `vbf.danang@courtmate.vn`: Liên đoàn Cầu lông Việt Nam (VBF) x Sở VH-TT
10. `sovhtt.danang@courtmate.vn`: Sở Văn hóa, Thể thao và Du lịch TP. Đà Nẵng
11. `nvhlaodong.danang@courtmate.vn`: Nhà Văn hóa Lao động TP. Đà Nẵng

#### Các thuộc tính (Schema Properties):
| Thuộc tính (Field) | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `_id` | `ObjectId` | Mã người dùng trong hệ thống |
| `email` | `String` | Email đăng nhập / liên hệ |
| `name` | `String` | Tên đơn vị / CLB tổ chức |
| `role` | `String` | Vai trò hệ thống: `'ORGANIZER'` |
| `isVerified` | `Boolean` | Tích xanh xác minh uy tín (`true`) |
| `preferences` | `Object` | Thông tin mở rộng: `{ profileType: 'ORGANIZER', sports: [...], location: 'Da Nang', clubName: ... }` |
| `createdAt` | `Date` | Thời gian khởi tạo tài khoản |
| `updatedAt` | `Date` | Thời gian cập nhật gần nhất |

---

## 3. Quản Lý Migration (CLI Commands)

Tại thư mục `apps/backend`, sử dụng `migrate-mongo` để quản lý:

```bash
# Kiểm tra trạng thái migration
npm run migrate:status

# Chạy migration mới
npm run migrate:up

# Rollback migration gần nhất (nếu cần hoàn tác)
npm run migrate:down
```
