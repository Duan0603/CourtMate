---
phase: COURTMATE-02-venue-booking-match-control-center
plan: "02-02"
subsystem: ui
tags: [react-native, expo, typescript, chat, maps]

# Dependency graph
requires:
  - "02-01"
provides:
  - Dynamic interactive GPS tracking popover modal for teammates or booked venue
  - Context-aware venue details modal dynamically loaded from active chat channel info
  - Seamless Tab transitions between personal schedule list (Lịch hẹn) and group chat inbox (Hộp thư Chat)
  - Immediate phone connection support for assistance in header
affects:
  - COURTMATE-02-venue-booking-match-control-center

# Tech tracking
tech-stack:
  added: []
  patterns: [Dynamic map pin coordinate shifting, Context-aware popover info resolving, Tabbed segmented layout bindings]

key-files:
  modified:
    - frontend/app/(tabs)/chat.tsx

key-decisions:
  - "Định vị bản đồ giả lập thông minh theo loại phòng chat: nhóm ghép kèo hiển thị vị trí các bạn chơi, phòng đặt đại lý hiển thị khoảng cách địa lý đến sân đặt."
  - "Tra cứu chéo giữa danh sách các đặt sân (userMatches) và dữ liệu sân cụ thể (venues) để cung cấp thông tin hóa đơn động chi tiết khớp chính xác với phòng chat hiện tại."
  - "Kích hoạt nút gọi nhanh (PhoneCall) trong header và modal thông tin sân giúp liên hệ khẩn cấp trực tiếp."

patterns-established:
  - "Sử dụng useMemo để giải quyết bất đồng bộ và đồng bộ động thông tin chi tiết của phòng chat đang hoạt động."
  - "Nhúng bản đồ giả lập GPS động với pins vị trí thực tế của đồng đội/đại lý kèm khoảng cách địa lý."

requirements-completed:
  - CHAT-01
  - CHAT-02
  - CHAT-03

# Metrics
duration: 40min
completed: 2026-06-21
status: complete
---

# Plan 02-02: Chat & Schedule Screen Summary

**Thiết kế và tối ưu hóa hệ thống chuyển đổi Tab Lịch hẹn/Hộp thư chat nhóm, đồng bộ hóa tự động dữ liệu đặt lịch thành phòng chat mới và nâng cấp hai Popover Modal Vị trí thực tế / Thông tin sân đặt động.**

## Performance

- **Duration:** 40 min
- **Started:** 2026-06-21T18:40:00Z
- **Completed:** 2026-06-21T19:20:00Z
- **Tasks:** 2 completed
- **Files modified:** 1

## Accomplishments
- Đồng bộ hóa tab "Lịch hẹn của tôi" và "Hộp thư Chat" dựa trên danh sách `userMatches` và `activeConversations` từ Mock Context chung.
- Xử lý cơ chế đồng bộ tự động: khi đặt sân thành công ở màn hình Booking, một cuộc trò chuyện với "Tiếp tân đại lý" tự động hiển thị trong Hộp thư Chat và vé vào sân tự động xuất hiện ở tab Lịch hẹn sắp diễn ra.
- Thiết kế lại Popover "Vị trí thực tế" (GPS pins): hiển thị pin địa lý động, nếu là chat ghép đối thủ/kèo sẽ hiển thị Quân (0.6km) và Sơn (1.1km) kèm avatar; nếu là chat đặt đại lý sẽ hiển thị vị trí từ Bạn đến Đại lý Sân.
- Thiết kế lại Popover "Thông tin sân đặt": giải quyết động dựa trên phòng chat đang mở để lấy hình ảnh sân, địa chỉ, khung giờ đặt, số lượng slot và trạng thái thanh toán thật.

## Task Commits

1. **Task 1: Tối ưu hóa Segmented Control và Đồng bộ Lịch hẹn & Chat** - `338d27b` (feat)
2. **Task 2: Nâng cấp Popover Modal Vị trí đồng đội và Thông tin sân đặt** - `338d27b` (feat)

## Files Created/Modified
- `frontend/app/(tabs)/chat.tsx` - Màn hình Chat với cơ chế Tab đôi, danh sách phòng trò chuyện và chi tiết Popover Modal GPS/Venue động.

## Decisions Made
- Sử dụng hàm kiểm tra chuỗi `currentChat.title.includes('Đặt Sân')` để phân tách logic render giao diện bản đồ GPS và nút gọi điện phù hợp giữa đại lý sân và bạn chơi cùng phòng.

## Next Phase Readiness
- Toàn bộ tính năng cốt lõi của Phase 2 (Venue Booking & Match Control Center) đã hoàn tất, biên dịch thành công không có lỗi TypeScript, giao diện đáp ứng chuẩn Mobile Responsive & tối ưu vùng ngón cái (Single-hand touch targets).
