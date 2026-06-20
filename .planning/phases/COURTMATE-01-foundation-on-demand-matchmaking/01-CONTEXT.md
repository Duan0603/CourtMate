# Phase 1: Foundation & On-Demand Matchmaking - Context

**Gathered:** 2026-06-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Thiết kế khung ứng dụng React Native/Expo, Trang chủ GPS và màn hình tìm kiếm matchmaking On-demand (radar quét, bottom sheet).
</domain>

<decisions>
## Implementation Decisions

### Tech Stack & Languages
- **D-01:** Sử dụng TypeScript với strict mode (`strict: true`) và cấu hình path aliasing (alias `@/*` trỏ về thư mục gốc `/`).
- **D-02:** Sử dụng React Native và Expo làm framework phát triển chính cho ứng dụng di động.

### Navigation & Routing
- **D-03:** Sử dụng Expo Router với cơ chế file-system routing (thư mục `app/`).
- **D-04:** Thiết kế Bottom Navigation Bar cố định gồm 4 tab: Trang chủ (Home), Bản đồ tìm kiếm (Map), Lịch trình (Schedule), Hồ sơ (Profile).

### UI/UX & Animations
- **D-05:** Thiết kế chủ đạo Dark Mode với màu nhấn Neon Green (Lime Green).
- **D-06:** Tối ưu hóa "Thumb Zone" cho các thao tác một tay với touch targets lớn nằm trong tầm với ngón cái (đặc biệt là nút "TÌM ĐỒNG ĐỘI NGAY").
- **D-07:** Sử dụng thư viện `react-native-reanimated` chạy trên UI Thread để thực hiện hiệu ứng Radar quét sóng thời gian thực, đảm bảo không bị drop frame.

### Map & Matchmaking
- **D-08:** Sử dụng thư viện `react-native-maps` để hiển thị bản đồ tìm kiếm toàn màn hình.
- **D-09:** Sử dụng dữ liệu giả lập (mock data) hoàn toàn trên Client, bao gồm mock tọa độ của người dùng và các sân/đối thủ lân cận để hiển thị trên bản đồ.
- **D-10:** Thiết kế Bottom Sheet vuốt lên hiển thị thông tin kèo chờ (thể thao, khoảng cách, trình độ, slots trống) và cho phép Tham gia/Hủy bằng 1 chạm.

### Styling & Design System
- **D-11:** Sử dụng đồng nhất NativeWind (Tailwind CSS) cho toàn bộ các styles tĩnh. Cấm sử dụng thuộc tính inline `style` trừ các giá trị động/hoạt ảnh (như từ `react-native-reanimated`) hoặc tính toán vị trí động.
- **D-12:** Sử dụng các tiện ích kích thước chuẩn của Tailwind (ví dụ: `text-xs`, `text-sm`, `text-base`, `text-lg`) để xây dựng kiểu chữ thay vì mở rộng cấu hình Tailwind bằng các phím kiểu chữ tùy chỉnh.

### Agent's Discretion
- Kiến trúc thư mục chi tiết (components, hooks, constants) và các chi tiết cài đặt code style cụ thể được giao hoàn toàn cho agent quyết định, miễn là tuân thủ TypeScript strict và Expo Router.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Specifications
- [PROJECT.md](file:///d:/EXE101/.planning/PROJECT.md) — Định nghĩa mô hình, giá trị cốt lõi và các quyết định công nghệ tổng thể.
- [REQUIREMENTS.md](file:///d:/EXE101/.planning/REQUIREMENTS.md) — Chi tiết danh sách yêu cầu tính năng (HOME, MAP, DSGN).
- [ROADMAP.md](file:///d:/EXE101/.planning/ROADMAP.md) — Lộ trình thực hiện dự án và tiêu chí thành công từng phase.
- [STATE.md](file:///d:/EXE101/.planning/STATE.md) — Trạng thái hiện tại của dự án.
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Dự án hiện tại đang ở trạng thái Greenfield (chưa có code ứng dụng thực tế). Tất cả các assets sẽ được khởi tạo mới.

### Established Patterns
- Dự án mới hoàn toàn, chưa có pattern code ứng dụng được thiết lập. Tuy nhiên, dự án yêu cầu tuân thủ cấu trúc của Expo Router (`app/` directory) và cấu hình TypeScript strict.

### Integration Points
- Khởi tạo cấu trúc dự án Expo mới tại thư mục gốc của workspace.
</code_context>

<specifics>
## Specific Ideas

- Người dùng chạm vào nút lớn "TÌM ĐỒNG ĐỘI NGAY" ở Trang chủ sẽ chuyển sang màn hình tìm kiếm Bản đồ có Radar quét sóng.
- Hiệu ứng Radar cần mượt mà, dùng Reanimated để tránh lag UI thread.
- Bottom Sheet kèo chờ hiển thị các thông tin: môn thể thao, khoảng cách, trình độ, slots thiếu và nút Tham gia/Hủy 1 chạm.
- Tận dụng tối đa Thumb Zone cho các nút thao tác chính.
</specifics>

<deferred>
## Deferred Ideas

- Tích hợp API Backend và cơ sở dữ liệu thực tế (hoãn sang v2 / Phase sau).
- Tích hợp cổng thanh toán trực tuyến đặt sân (hoãn sang v2 / Phase sau).
- Phase 2: Đặt sân cụ thể theo slot giờ & Nhóm chat tích hợp nút thao tác nhanh (sẽ thực hiện trong Phase 2).
</deferred>

---

*Phase: 1-Foundation & On-Demand Matchmaking*
*Context gathered: 2026-06-18*
