# Requirements: CourtMate

**Defined:** 2026-06-18
**Core Value:** Giúp người dùng di động nhanh chóng tìm được bạn chơi thể thao xung quanh vị trí của họ tức thì (On-demand matchmaking).

## v1 Requirements

### Home Dashboard (Trang Chủ)

- [ ] **HOME-01**: Thiết kế Trang chủ di động có hiển thị định vị GPS và thanh tìm kiếm nhanh.
- [ ] **HOME-02**: Danh sách môn thể thao (Cầu lông, Bóng rổ, Bóng đá...) trượt ngang (Horizontal Scroll).
- [ ] **HOME-03**: Nút "TÌM ĐỒNG ĐỘI NGAY" lớn ở trung tâm, dễ chạm bằng một ngón cái.

### Matchmaking (Tìm kiếm On-demand)

- [ ] **MAP-01**: Bản đồ toàn màn hình hiển thị vị trí người dùng và các sân/đối thủ lân cận.
- [ ] **MAP-02**: Hiệu ứng Radar quét sóng thời gian thực khi đang tìm trận.
- [ ] **MAP-03**: Bottom Sheet vuốt lên hiển thị thông tin kèo chờ gồm môn thể thao, khoảng cách, trình độ, số slots thiếu.
- [ ] **MAP-04**: Thao tác 1 chạm để tham gia hoặc hủy tham gia trận tìm kiếm.

### Venue Booking (Đặt Sân)

- [ ] **BOOK-01**: Giao diện Card UI hiển thị hình ảnh sân, đánh giá sao và khoảng cách.
- [ ] **BOOK-02**: Lưới chọn giờ (Time-slot grid) phân biệt rõ slot trống (Xanh) và slot đã đặt (Xám).
- [ ] **BOOK-03**: Nút "Đặt sân ngay" được cố định ở đáy màn hình (Sticky Bottom Button).

### Match & Chat (Lịch Hẹn & Nhóm Chat)

- [ ] **CHAT-01**: Giao diện Tab đôi (Segmented Control) cho phép chuyển đổi giữa Lịch hẹn và Hộp chat.
- [ ] **CHAT-02**: Hộp thoại chat nhóm kích hoạt tự động sau khi kết nối trận thành công.
- [ ] **CHAT-03**: Nút thao tác nhanh trong khung chat: xem vị trí đồng đội và thông tin chi tiết sân đã đặt.

### UI/UX Guidelines (Quy Chuẩn Giao Diện)

- [ ] **DSGN-01**: Giao diện Dark Mode chủ đạo kết hợp màu xanh Neon/Lime Green làm điểm nhấn nổi bật.
- [ ] **DSGN-02**: Bố cục các nút hành động quan trọng nằm trong vùng dễ chạm của ngón cái (Thumb Zone).
- [ ] **DSGN-03**: Thanh điều hướng đáy (Bottom Navigation Bar) cố định gồm 4 tab: Trang chủ, Bản đồ tìm kiếm, Lịch trình, Hồ sơ.

## v2 Requirements

### Syncing & Services

- **SYNC-01**: Tích hợp cơ sở dữ liệu thực tế và Backend API.
- **PAY-01**: Tích hợp cổng thanh toán trực tuyến để thanh toán đặt sân.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Tích hợp cơ sở dữ liệu và API thực tế | Đơn giản hóa cấu trúc dữ liệu ở v1, tập trung hoàn thiện UI/UX và luồng trải nghiệm trước |
| Hệ thống thanh toán thực tế | Tránh chi phí và độ phức tạp tích hợp trong giai đoạn thiết kế mẫu thử |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| HOME-01 | Phase 1 | Pending |
| HOME-02 | Phase 1 | Pending |
| HOME-03 | Phase 1 | Pending |
| MAP-01 | Phase 1 | Pending |
| MAP-02 | Phase 1 | Pending |
| MAP-03 | Phase 1 | Pending |
| MAP-04 | Phase 1 | Pending |
| BOOK-01 | Phase 2 | Pending |
| BOOK-02 | Phase 2 | Pending |
| BOOK-03 | Phase 2 | Pending |
| CHAT-01 | Phase 2 | Pending |
| CHAT-02 | Phase 2 | Pending |
| CHAT-03 | Phase 2 | Pending |
| DSGN-01 | Phase 1 | Pending |
| DSGN-02 | Phase 1 | Pending |
| DSGN-03 | Phase 1 | Pending |

**Coverage:**
- v1 requirements: 16 total
- Mapped to phases: 16
- Unmapped: 0 ✓

---
*Requirements defined: 2026-06-18*
*Last updated: 2026-06-18 after initial definition*
