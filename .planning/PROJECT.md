# CourtMate

## What This Is

CourtMate is a mobile application built using React Native/Expo designed to help sports enthusiasts find sports matches on-demand (Grab-like matchmaking) and book court slots in real-time. The initial focus is on designing the Mobile UI/UX and Mobile User Flow.

## Core Value

Giúp người dùng di động nhanh chóng tìm được bạn chơi thể thao xung quanh vị trí của họ tức thì (On-demand matchmaking).

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Thiết kế Trang chủ di động (Home Screen) tích hợp định vị GPS, thanh tìm kiếm nhanh, Dashboard trung tâm với nút "TÌM ĐỒNG ĐỘI NGAY" lớn dễ chạm bằng một tay và menu trượt ngang chọn môn thể thao.
- [ ] Thiết kế Luồng tìm bạn On-demand (Matchmaking Screen) hiển thị Bản đồ toàn màn hình, hiệu ứng Radar quét thời gian thực và Bottom Sheet hiển thị thông tin kèo chờ kèm thao tác 1 chạm để Tham gia/Hủy.
- [ ] Thiết kế Trang chi tiết sân & Đặt slot (Venue Booking Screen) dạng Card UI có lưới ma trận chọn giờ (Time-slot grid) phân biệt trạng thái trống (Xanh) hoặc hết (Xám), cùng nút "Đặt sân ngay" cố định ở đáy màn hình.
- [ ] Thiết kế Quản lý lịch trình & Chat (My Match & Chat) sử dụng tab đôi (Segmented Control), kích hoạt chat nhóm khi tìm kèo thành công cùng hai nút thao tác nhanh: xem vị trí bạn chơi và thông tin sân đã đặt.
- [ ] Áp dụng quy chuẩn thiết kế Mobile (Mobile Design Guidelines): Bố cục trong vùng dễ chạm (Thumb Zone), chủ đạo Dark Mode kết hợp Neon Green (Lime Green) làm nổi bật các nút quan trọng, thanh điều hướng đáy (Bottom Navigation Bar) 4 tab.

### Out of Scope

- Tích hợp Backend API và Cơ sở dữ liệu thực tế — Tạm thời hoãn lại (sử dụng dữ liệu giả lập hoạt động động trên giao diện ở v1).

## Context

- Môi trường phát triển: React Native kết hợp Expo để dễ dàng xem trước và kiểm thử trên thiết bị di động.
- Tập trung vào tính tương tác cao của luồng di động (Radar quét thực tế, Bottom Sheet vuốt chạm, Lưới slot giờ, Chuyển đổi tab lịch hẹn/chat).

## Constraints

- **Tech Stack**: React Native / Expo — Định hướng đa nền tảng iOS & Android.
- **Dữ liệu**: Mock Data — Đơn giản hóa backend để tập trung hoàn thiện trải nghiệm UI/UX.
- **Thiết kế**: Mobile Responsive & Single-hand touch targets — Nút CTA lớn nằm trong vùng dễ với của ngón cái.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| React Native / Expo | Đảm bảo tính nhất quán đa nền tảng và dễ dàng phát triển Mobile UI/UX mẫu nhanh chóng. | — Pending |
| Dữ liệu giả lập (Mock data) | Tập trung hoàn thiện giao diện người dùng và luồng trải nghiệm trước khi kết nối API Backend. | — Pending |
| Chế độ YOLO | Tiết kiệm thời gian tương tác giữa người dùng và Agent trong quá trình viết mã. | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-06-18 after initialization*
