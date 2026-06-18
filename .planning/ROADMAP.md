# Roadmap: CourtMate

## Overview

Dự án thiết kế và xây dựng mẫu thử tương tác Mobile UI/UX cho ứng dụng tìm bạn chơi thể thao CourtMate bằng React Native/Expo. Bản thử nghiệm tập trung tối ưu hóa "Vùng ngón cái" (Thumb Zone), hỗ trợ giao diện tối (Dark Mode) và điểm nhấn Neon Green, hoạt động trên cơ sở dữ liệu giả lập (mock data).

## Phases

- [ ] **Phase 1: Foundation & On-Demand Matchmaking** - Thiết kế điều hướng tab, Trang chủ GPS, bản đồ tìm kiếm Radar và Bottom Sheet kèo chờ.
- [ ] **Phase 2: Venue Booking & Match Control Center** - Thiết kế giao diện đặt sân theo slot, quản lý lịch hẹn và nhóm chat tích hợp nút thao tác nhanh.

## Phase Details

### Phase 1: Foundation & On-Demand Matchmaking
**Goal**: Thiết kế khung ứng dụng React Native/Expo, Trang chủ GPS và màn hình tìm kiếm matchmaking On-demand (radar quét, bottom sheet).
**Mode**: mvp
**Depends on**: Nothing (first phase)
**Requirements**: HOME-01, HOME-02, HOME-03, MAP-01, MAP-02, MAP-03, MAP-04, DSGN-01, DSGN-02, DSGN-03
**Success Criteria** (what must be TRUE):
  1. Người dùng thấy thanh điều hướng đáy (Bottom Navigation Bar) 4 tab hoạt động mượt mà.
  2. Trang chủ hiển thị định vị GPS và danh sách các icon môn thể thao cuộn ngang.
  3. Người dùng bấm được nút "TÌM ĐỒNG ĐỘI NGAY" lớn trong tầm với ngón cái ở Home Screen để kích hoạt tìm kiếm.
  4. Màn hình tìm kiếm hiển thị bản đồ toàn màn hình cùng hiệu ứng sóng quét Radar thời gian thực.
  5. Bottom Sheet hiển thị đầy đủ thông tin kèo chờ và cho phép Tham gia/Hủy bằng 1 chạm.
**Plans**: 3 plans

- [x] 01-01: Khởi tạo dự án React Native/Expo, cấu hình Safe Area và thanh điều hướng Bottom Navigation Bar.
- [x] 01-02: Thiết kế giao diện Trang chủ (Home Screen) với GPS location và Sport Horizontal Scroll.
- [x] 01-03: Thiết kế Bản đồ tìm kiếm, hiệu ứng Radar quét sóng và Bottom Sheet kèo chờ tương tác.

### Phase 2: Venue Booking & Match Control Center
**Goal**: Thiết kế chi tiết giao diện Đặt sân và Hộp thoại chat quản lý lịch hẹn tích hợp.
**Mode**: mvp
**Depends on**: Phase 1
**Requirements**: BOOK-01, BOOK-02, BOOK-03, CHAT-01, CHAT-02, CHAT-03
**Success Criteria** (what must be TRUE):
  1. Người dùng chạm xem được Card UI thông tin sân và lưới chọn slot giờ (Time-slot grid) đổi màu Xanh/Xám tương ứng.
  2. Nút "Đặt sân ngay" hiển thị cố định ở đáy màn hình (Sticky Bottom Button) hoạt động khi chọn slot.
  3. Người dùng chuyển đổi được giữa Lịch hẹn và Hộp chat bằng Tab đôi (Segmented Control).
  4. Giao diện chat nhóm hiển thị các nút thao tác nhanh: xem vị trí đồng đội và thông tin sân đã đặt.
**Plans**: 2 plans

Plans:
- [ ] 02-01: Thiết kế giao diện Đặt sân (Venue Booking Screen) dạng Card UI và lưới chọn ma trận Slot giờ.
- [ ] 02-02: Thiết kế Giao diện tab đôi Lịch hẹn & Hộp chat nhóm (Chat Screen) kèm các nút thao tác nhanh.

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation & Matchmaking | v1.0 MVP | 3/3 | Completed | 2026-06-18 |
| 2. Booking & Control Center | v1.0 MVP | 0/2 | Not started | - |
